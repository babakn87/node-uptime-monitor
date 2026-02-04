import TelegramBot from "node-telegram-bot-api";
// import { SocksProxyAgent } from "socks-proxy-agent";
import { check_active_access, save_bot_log } from "./repositories.js";
import {authentication} from "./Authentication/auth.js"
import path from 'path';
import dotenv from "dotenv"
dotenv.config()

const token = process.env.TOKEN
// const agent = new SocksProxyAgent('socks5h://127.0.0.1:1080')
const userStates = {};

const bot = new TelegramBot(token, {
    polling: true,
    // request: {agent}
})


bot.onText(/\/login/, (msg) => {
    const chatId = msg.chat.id;

    userStates[chatId] = {
        step: 'awaiting_username',
        username: ''
    };

    bot.sendMessage(chatId, 'Enter your username : ');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!userStates[chatId]) return;

    const state = userStates[chatId];

    if (state.step === 'awaiting_username') {
        state.username = text;
        state.step = 'awaiting_password';

        bot.sendMessage(chatId, 'Enter your password : ');
        return;
    }

    if (state.step === 'awaiting_password') {
        const password = text;


        if(await authentication(state.username, password , chatId)){
            bot.sendMessage(chatId , `Welcome User : ${state.username} ✅️`)
            await save_bot_log(`User ${chatId} logged in.`)
        }else{
            bot.sendMessage(chatId, "Wrong username or password ⛔")
        }


        delete userStates[chatId];
  }
});


bot.onText(/\/getnd/, (msg) => {
    const chatId = msg.chat.id;
    send_logs(chatId);
});




export async function send_alert(admin_alert , nurmal_alert , CI) {
    for(let j = (CI.length)-1; j>=0; j--){
        if(j == 0){
            for(let i = (CI[j].length)-1; i>=0; i--){
                bot.sendMessage(CI[j][i] , admin_alert)
            }
        }else{
            for(let i = (CI[j].length)-1; i>=0; i--){
                bot.sendMessage(CI[j][i] , nurmal_alert)
            }
        }
    }
}


async function send_logs(chatid) {
    if(await check_active_access(chatid)){
        const filePath = path.join(process.cwd() , 'logs' , 'logs.json')
        bot.sendDocument(chatid , filePath)
        await save_bot_log(`The log database json file was sent to ${chatid}`)
    }
}


