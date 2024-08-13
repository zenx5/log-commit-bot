import dotenv from 'dotenv'
import { Bot, InlineKeyboard } from "grammy";
import { getCurrent, getLastCommits, info, setRepository, setToken } from './commands';

dotenv.config()

//Store bot
let token = ""
let repository = {
  user: "zenx5",
  repo: "foda-2",
  commit: ""
}


//Create a new bot
const bot = new Bot(process.env.NODE_BOT_TOKEN as string);

// command handlers
bot.command("info", info)

bot.command("commit", getLastCommits(token, repository));

bot.command("token", setToken( newToken => token=newToken ));

bot.command("set", setRepository(repository, (key, value) => repository[key] = value ));

bot.command("current", getCurrent(repository));

//Start the Bot
bot.start();