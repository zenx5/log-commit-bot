import { CommandContext, Context } from "grammy"

export const info = async (ctx:CommandContext<Context>) => {
    // const message = `This bot is a simple bot that can be used to get information about a repository on GitHub. It can also be used to get the last commits in a repository.`
    // await ctx.reply(message);
    await ctx.reply( JSON.stringify( ctx.chat ) )
}

export const getLastCommits = (token:string, repository:{ user:string, repo:string}) => async (ctx:CommandContext<Context>) => {
    try{
        const args = ctx.message?.text.split(" ").slice(1) as string[]
        const length = args.pop()
        const [user, repo] = args
        let url = "https://api.github.com/repos/{user}/{repo}/commits";
        url = ( !user || !repo )? url.replace("{user}", repository.user).replace("{repo}", repository.repo) : url.replace("{user}", user).replace("{repo}", repo);
        const headers = new Headers()
        headers.set("Accept","application/vnd.github+json")
        headers.set("X-GitHub-Api-Version","2022-11-28")
        if( token.length > 5 ){
            headers.set("Authorization", `Bearer ${token}`)
        }
        const response = await fetch( url, {
            headers
        } )
        if( response.status !== 200 ) return await ctx.reply(response.statusText)
        const commits = await response.json() as { commit:{ author:{ name:string } , message:string }, sha:string  }[]
        if( commits.length === 0 ) return await ctx.reply("No commits found")
        let message = `<b>Last Commits in ${user ? user : repository.user}/${repo ? repo : repository.repo}:</b>\n`
        const listSize = length ? Number(length) : 3
        for( const {commit, sha} of commits.slice(0, listSize) ){
            message += ` \n<b>Commit ${sha}:</b>\n(by ${commit.author.name})`
            message += ` \n\t<i>${commit.message}</i>\n\n`
        }
        await ctx.reply(message, { parse_mode: "HTML" });
    }catch(e){
        console.log(e)
        await ctx.reply("An error occurred")
    }
}


export const setToken = (onUpdate:(token:string)=>void) => async (ctx:CommandContext<Context>) => {
    const [tokenInput] = ctx.message?.text.split(" ").slice(1) as string[]
    ctx.deleteMessage()
    if( tokenInput === undefined || tokenInput.length<5 ) return await ctx.reply("Invalid token")
    onUpdate(tokenInput)
    await ctx.reply("Token set successfully")
}

export const setRepository = (repository:{user:string, repo:string}, onChange:(key:keyof typeof repository, value:string)=>void) => async (ctx:CommandContext<Context>) => {
    const [key, value] = ctx.message?.text.split(" ").slice(1) as string[]
    if( key.toLowerCase()==="commit" || key === undefined ) return await ctx.reply("Invalid key")
    const oldValue = repository[key as keyof typeof repository]
    if( oldValue === undefined ) await ctx.reply("Invalid key");
    //repository[key as keyof typeof repository] = value;
    onChange(key as keyof typeof repository, value)
    await ctx.reply(`In Repository set ${key} to ${value}`);
}

export const getCurrent = (repository:{user:string, repo:string}) => async (ctx:CommandContext<Context>) => {
    let message = `In Current Repository: \n<b>User:</b> ${repository.user}\n<b>Repository:</b> ${repository.repo}`
    await ctx.reply(message,{parse_mode:'HTML'});
}