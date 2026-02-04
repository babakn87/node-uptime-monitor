import chalk from "chalk";
import readline from "readline/promises";
import {get_active_chatid, get_bot_logs, get_logs, save_log} from "./repositories.js"
import {lowerFirstFive , number_validator , null_validator , main_operation_validator , database_id_validator , is_success_Validator} from './validators/number.validators.js';
import { url_validator } from "./validators/url.validators.js";
import { user_id_pass_validator, id_validator } from "./Authentication/auth.js"
import { playSound } from "./alert.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUrl = null;
let currentTimer = null;
let isInteracting = false;
let URL_replacement = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bot;
let bot_flag = false;

console.log(chalk.cyan(`
     .-') _             _   .-')    
    ( OO ) )           ( '.( OO )_  
,--./ ,--,' ,--. ,--.   ,--.   ,--.)
|   \\ |  |\\ |  | |  |   |   \`.'   | 
|    \\|  | )|  | | .-') |         | 
|  .     |/ |  |_|( OO )|  |'.'|  | 
|  |\\    |  |  | | \`-' /|  |   |  | 
|  | \\   | ('  '-'(_.-' |  |   |  | 
\`--'  \`--'   \`-----'    \`--'   \`--' 
`));


async function bot_token() {
    if(process.env.TOKEN){
        console.log(chalk.cyan("The Telegram bot token has already been registered To continue with the current token, press (Y) To change the token, press (N)"))
        const resp = await rl.question("")

        while(true){
            if(resp.toLocaleLowerCase() == "y"){
                import("./telegram_bot.js");
                bot = await import("./telegram_bot.js");

                console.log(chalk.green("The system was connected to the robot"))
                bot_flag = true;
                break
            }else{
                if(resp.toLocaleLowerCase() == "n"){
                    fs.writeFileSync('.env' , '');
                    const envPath = path.join(__dirname, ".env");
                    const key = "TOKEN"
                    const value = await rl.question("Enter bot token : ");
                    const newLine = `${key}=${value}\n`;
                    fs.appendFileSync(envPath, newLine, "utf8");
                    import("./telegram_bot.js");
                    bot = await import("./telegram_bot.js");
                    bot_flag = true

                    console.log(chalk.green("The system was connected to the robot"))
                    break
                }else{
                    console.log(chalk.red("value not valid !"))
                    console.log("Do you have a robot token? (y/n) \n")
                    response = await rl.question("")
                }
            }
        }

    }else{
        console.log("Do you have a robot token? (y/n) \n")
        let response = await rl.question("")
        const envPath = path.join(__dirname, ".env");
        const key = "TOKEN"
    

        while(true){
            if(response.toLocaleLowerCase() == "y"){
                const value = await rl.question("Enter bot token : ");
                const newLine = `${key}=${value}\n`;
                fs.appendFileSync(envPath, newLine, "utf8");
                import("./telegram_bot.js");
                bot = await import("./telegram_bot.js");

                console.log(chalk.green("The system was connected to the robot"))
                bot_flag = true;
                break
            }else{
                if(response.toLocaleLowerCase() == "n"){
                    break
                }else{
                    console.log(chalk.red("value not valid !"))
                    console.log("Do you have a robot token? (y/n) \n")
                    response = await rl.question("")
                }
            }
        }
    }
}

await bot_token()


async function check_status() {

    if(isInteracting || !currentUrl) {
        return
    }

    try{
        const timestamp = new Date().toLocaleString()
        const start = Date.now()
        const response = await fetch(currentUrl)
        const duration = Date.now() - start

        const isSuccess = response.ok
        if(!isSuccess){
            playSound('./alarm.wav')
            if(bot_flag){
                const chatid = await get_active_chatid()
                bot.send_alert(`🌐 URL : ${response.url} \n\n 🔴 ResponseStatus : ${response.status} \n\n ✅ OK : ${response.ok} \n\n ⏱️ ResponseTime : ${timestamp} \n\n 📦 ResponseType : ${response.type} \n\n 🔀 Redirected : ${response.redirected}` , "Tell the manager to check the system ⚠️" , chatid)
            }            
        }
        const color = isSuccess ? chalk.green : chalk.yellow
        const status = isSuccess ? `[${currentUrl}] => "Online"` : `System Alert [${currentUrl}] (Not 200)`
        const data = `${status} | Code : ${response.status} | Speed : ${duration}ms`
        await save_log(currentUrl , response.status , duration , status , isSuccess)
        console.log(color(`${data} | ${timestamp}`))
    }catch(err){
        console.log(chalk.red("Netwok Error : \n") , err)
        await save_log(currentUrl, null, null, `Network Error: ${err.message}`, 0);
    }

    if(!isInteracting){
        currentTimer = setTimeout(check_status , 2000)
    }
}


let main_menu;
async function get_main_operation() {
    console.log(chalk.cyan(`
    Monitor URL : 1
    Search in the database : 2
    Set user in bot : 3
    Exit the program : 4
    `));
    main_menu = await rl.question(chalk.blue("\n Enter the main operation number : "))
    while(!main_operation_validator(main_menu)){
        main_menu = await rl.question(chalk.blue("\n Enter the main operation number : "))
    }
    Operation()
}

await get_main_operation()

async function Operation() {
    if(main_menu == 1){
        let url;
        while(currentUrl == null){
            url = await rl.question(chalk.blue("Enter URL (e.g., https://google.com): "));
            await isFetchableURL(url)
        }
    } else {
        if(main_menu == 2){
            search()
        }else{
            if(main_menu == 3){ 
                register_admin()
            }else{
                if(main_menu == 4){
                    console.log(chalk.red("The program stopped"))
                    process.exit()
                }
            }
        }
    }
}

function isFetchableURL(value) {
    try {
        const url = new URL(value);
        if(url.protocol === "http:" || url.protocol === "https:"){
            if(URL_replacement){console.log(chalk.gray(`Monitoring switched to: ${value}\n`))}
            URL_replacement = false
            console.log(chalk.gray("...To exit the program, press Ctrl+C, to change the URL, press Ctrl+U, To return to the main menu, press Ctrl+f, and to search in the database, press Ctrl+S..."));
            currentUrl = url.href;
            if(currentUrl.endsWith("/")){currentUrl = currentUrl.slice(0 , -1)}
            currentUrl = lowerFirstFive(currentUrl)
            if(currentTimer) clearTimeout(currentTimer)
            isInteracting = false;
            check_status();
        } else {
            console.log(chalk.red("Error: Only http/https allowed"));
            return false;
        }
    } catch (err){
        console.log(chalk.red("Invalid URL:\n" , err));
        return false
    }
}


async function search() {
    process.stdin.setRawMode(false);
    isInteracting = true;
    if(currentTimer) clearTimeout(currentTimer)
    
    let op
    op = await rl.question(chalk.cyan(`
    Search in NUM database : 1
    Search in BOT database : 2

    >>>
    `)) 
    while(!database_id_validator(op)){
        op = await rl.question(chalk.cyan(`
        Search in NUM database : 1
        Search in BOT database : 2
        `)) 
    }

    if(op == 2){
        await get_bot_logs()
        get_main_operation()
    }

    const action = {
        "1" : async(Criterion) => await get_logs("id" , Criterion),
        "2" : async(Criterion) => await get_logs("url" , Criterion),
        "3" : async(Criterion) => await get_logs("is_success" , Criterion),
        "4" : async(Criterion) => await get_logs("status_code" , Criterion),
        "5" : async() => await get_logs("status_code" , 'null')
    }

    const action_id = {
        "1" : "ID",
        "2" : "URL",
        "3" : "Is_Success",
        "4" : "status_code",
        "5" : `"Type the value 'null' into"`
    }

    const validation = {
        "1" : async(id) => await id_validator(id),
        "2" : async(url) => await url_validator(url),
        "3" : async(is_success) => await is_success_Validator(is_success),
        "4" : async(code) => await number_validator(code),
        "5" : async(nul) => null_validator(nul)
    }

    let fild = await rl.question(chalk.blue(`Which field do you want to search in the logs : \n\n ID            = 1 \n URL           = 2 \n Is_Success    = 3 \n StatusCode    = 4\n Network Error = 5 \n\n >>>`))
    while(true){
        fild = Number(fild)
        if(fild > 0 && fild < 6 && Number.isInteger(fild)){
            break
        }else{
            console.log(chalk.red("Number out of range!"))
            fild = await rl.question(chalk.blue(`Which field do you want to search in the logs : \n\n ID            = 1 \n URL           = 2 \n Is_Success    = 3 \n StatusCode    = 4\n Network Error = 5 \n\n >>>`))

        }
    }

    let criterion = await rl.question(chalk.cyan(`Enter ${action_id[fild]} : `));
    if(Number(fild) == 2) {
        criterion = lowerFirstFive(criterion)
    }

    while(true){
        const result = await validation[fild](criterion);
        if(result == true){
            const data = await action[fild](criterion)
            console.log(chalk.yellow(`Number of items found: ${data.length}`)); 

            if (Array.isArray(data)) {
                console.table(data);
            } else {
                console.log(data);
            }

            break
        }else{
            if(result == 13){
                break
            }
            criterion = await rl.question(chalk.cyan(`Enter ${action_id[fild]} : `));
        }
    }

    isInteracting = false
    if(currentUrl != null){
        isFetchableURL(currentUrl)
    }else{
        get_main_operation()
    }
    process.stdin.setRawMode(true)
}


process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on("data" , async(key) => {
    if(key == "\u0003") {
        console.log(chalk.red("The program stopped"))
        process.exit()
    }

    if(key == "\u0015") {
        process.stdin.setRawMode(false);
        isInteracting = true;
        URL_replacement = true;
        if(currentTimer) clearTimeout(currentTimer)
        console.log(chalk.gray("\n--- Changing URL ---"))
        let newURL;
        while(isInteracting){
            newURL = await rl.question(chalk.cyan("Enter New URL : "))
            isFetchableURL(newURL)
        }
        process.stdin.setRawMode(true)
    }

    if(key == "\u0013") {
        search()
    }

    if(key == "\u0006"){
        process.stdin.setRawMode(false)
        isInteracting = true
        if(currentTimer) clearTimeout(currentTimer)
        if(currentUrl) {currentUrl = null}

        get_main_operation()

        isInteracting = false
        
        process.stdin.setRawMode(true)
    }



});

let id
let pass
let access

async function register_admin() {
    id = await rl.question(chalk.cyan("Enter username : "))
    pass = await rl.question(chalk.cyan("Enter user password : "))
    access = await rl.question(chalk.cyan("Enter user Access (0 : Nurmal | 1 : Admin) : "))

    while(!(await user_id_pass_validator(id,pass,access))){
        id = await rl.question(chalk.cyan("Enter username : "))
        pass = await rl.question(chalk.cyan("Enter user password : "))
        access = await rl.question(chalk.cyan("Enter user Access (0 : Nurmal | 1 : Admin) : "))
    }
    get_main_operation()
}


