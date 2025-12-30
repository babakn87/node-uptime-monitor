import chalk from "chalk";
import readline from "readline/promises";
import {save_log} from "./dependencies.js"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentUrl = null;
let currentTimer = null;
let isInteracting = false;

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


async function check_status() {

    if(isInteracting || !currentUrl) {
        console.log(chalk.red("Error in URL or other!"))
        return
    }

    try{
        const timestamp = new Date().toLocaleString()
        const response = await fetch(currentUrl)
        const isSuccess = response.status === 200
        const color = isSuccess ? chalk.green : chalk.yellow
        const status = isSuccess ? `[${currentUrl}] => "Online"` : `System Alert [${currentUrl}] (Not 200)`
        const data = `${status} | Code : ${response.status}`
        await save_log(data)
        console.log(color(`${data} | ${timestamp}`))
    }catch(err){
        console.log(chalk.red("Netwok Error : \n") , err)
        await save_log(`Network Error : \n ${err.message}`);
    }

    currentTimer = setTimeout(check_status , 2000)

}

currentUrl = await rl.question(chalk.blue("Enter URL (e.g., https://google.com): "));
check_status();

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on("data" , async(key) => {
    const char = key.toString();

    if(key == "\u0003") {
        console.log(chalk.red("The program stopped"))
        process.exit()
    }

    if(key == "\u0015") {
        isInteracting = true
        if(currentTimer) clearTimeout(currentTimer)
        process.stdin.setRawMode(false)

        console.log(chalk.gray("\n--- Changing URL ---"))
        const newURL = await rl.question(chalk.cyan("Enter New URL : "))

        if(newURL) {
            currentUrl = newURL
            console.log(chalk.gray(`Monitoring switched to: ${currentUrl}\n`))
        }
        process.stdin.setRawMode(true)
        isInteracting = false
        check_status()
    }


})
