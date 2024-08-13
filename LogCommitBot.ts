import dotenv from 'dotenv'
dotenv.config()
import { Bot } from "grammy";
import { getCurrent, getLastCommits, info, setRepository, setToken } from './commands';
import access from './database/middleware';



//Create a new bot
const bot = new Bot(process.env.NODE_BOT_TOKEN as string);

// command handlers
bot.command("info", access(info) )

bot.command("commit", access(getLastCommits) );

bot.command("token", access(setToken) );

bot.command("set", access(setRepository) );

bot.command("current", access(getCurrent));

//Start the Bot
bot.start();