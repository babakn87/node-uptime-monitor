import chalk from "chalk";
import fs from "fs/promises"

const FILE_NAME = "Logs.txt"

export async function save_log(data) {
    try{
        const timestamp = new Date().toLocaleString();
        await fs.appendFile(FILE_NAME , `${data} | ${timestamp}\n----------\n`);
    }catch(err){
        console.log(chalk.red("Error in log storage \n") , err)
    }
}

