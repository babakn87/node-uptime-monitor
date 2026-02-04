import chalk from "chalk";

export function url_validator(url) {
    try{
        const u = new URL(url)
         if(u.protocol === "http:" || u.protocol === "https:"){
            return true
         }else{
            console.log(chalk.red("Error: Only http/https allowed"));
         }
    } catch(err) {
        console.log(chalk.red("Invalid URL:\n" , err));
        return false
    }
}