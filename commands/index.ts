import { CommandContext, Context } from "grammy"
import Chat from "../database/models/Chat"

const templateUrl = "https://api.github.com/repos/{user}/{repo}/commits"

export const info = async (ctx:CommandContext<Context>, db:any) => {
    await ctx.reply(`Hola ${ctx.from?.first_name} bienvenido a Log Commit!`)
}

export const getLastCommits = async (ctx:CommandContext<Context>, db:any) => {
    try{
        const args = ctx.message?.text.split(" ").slice(1) as string[]
        const length = args.pop()
        const [user, repo] = args
        const url = ( !user || !repo )? templateUrl.replace("{user}", db.user).replace("{repo}", db.repo) : templateUrl.replace("{user}", user).replace("{repo}", repo);
        const headers = new Headers()
        headers.set("Accept","application/vnd.github+json")
        headers.set("X-GitHub-Api-Version","2022-11-28")
        if( db.token.length > 5 ){
            headers.set("Authorization", `Bearer ${db.token}`)
        }
        const response = await fetch( url, {
            headers
        } )
        if( response.status !== 200 ) throw new Error(response.statusText)
        const commits = await response.json() as { commit:{ author:{ name:string } , message:string }, sha:string  }[]
        if( commits.length === 0 ) throw new Error("No commits found")
        let message = `<b>Last Commits in ${user ? user : db.user}/${repo ? repo : db.repo}:</b>\n`
        const listSize = length ? Number(length) : 3
        for( const {commit, sha} of commits.slice(0, listSize) ){
            message += ` \n<b>Commit ${sha}:</b>\n(by ${commit.author.name})`
            message += ` \n\t<i>${commit.message}</i>\n\n`
        }
        await ctx.reply(message, { parse_mode: "HTML" });
    }catch(e:any){
        console.log(e)
        await ctx.reply(e.message)
    }
}


export const setToken = async (ctx:CommandContext<Context>, db:any) => {
    const [tokenInput] = ctx.message?.text.split(" ").slice(1) as string[]
    ctx.deleteMessage()
    if( tokenInput === undefined || tokenInput.length<5 ) await ctx.reply("Invalid token")
    else{
        await Chat.findOneAndUpdate({chatid:ctx.chat?.id}, {token:tokenInput})
        await ctx.reply("Token set successfully")
    }
}

export const setRepository =  async (ctx:CommandContext<Context>, db:any) => {
    try{
        const [key, value] = ctx.message?.text.split(" ").slice(1) as string[]
        if( key.toLowerCase()==="commit" || key === undefined ) throw new Error("Invalid key")
        const oldValue = db[key as keyof typeof db]
        if( oldValue === undefined ) await ctx.reply("Invalid key");
        await Chat.findOneAndUpdate({chatid:ctx.chat?.id}, {[key]:value})
        //updateOne({_id:db._id}, {[key as keyof typeof db]:value})
        await ctx.reply(`In Repository set ${key} to ${value}`);
    } catch(e:any){
        console.log(e)
        await ctx.reply(e.message)
    }
}

export const getCurrent = async (ctx:CommandContext<Context>, db:any) => {
    let message = `In Current Repository: \n<b>User:</b> ${db.user}\n<b>Repository:</b> ${db.repo}`
    await ctx.reply(message,{parse_mode:'HTML'});
}