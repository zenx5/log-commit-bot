import { connect, disconnect } from "./run"
import Chat from "./models/Chat"
import { CommandContext, Context } from "grammy"


export default function access(next: (ctx: CommandContext<Context>, db:any) => Promise<void>) {

    return async (ctx:CommandContext<Context>) => {
        try{
            await connect()
            console.log("Checking database connection")
            const data = await Chat.findOne({chatid: ctx.chat.id})
            if( !data ) {
                await Chat.create({
                    name: ctx.chat.username,
                    chatid: ctx.chat.id,
                    user: "",
                    repo: "",
                    token: ""
                })
                return await next(ctx, {
                    user: "",
                    repo: "",
                    token: ""
                })
            }
            return await next(ctx,data)
        }catch(e){
            console.log(e)
            await ctx.reply("An error occurred")
        } finally{
            disconnect()
        }
    }
}