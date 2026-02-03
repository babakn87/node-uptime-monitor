import chalk from "chalk";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import argon2 from "argon2";

const dbPromise = open({
    filename: ".monitoring_logs.db",
    driver: sqlite3.Database
});

const dbPromise_Users = open({
    filename: ".Users.db",
    driver: sqlite3.Database
})

const dbPromise_Bot_logs = open({
    filename: ".telegramBot_logs.db",
    driver: sqlite3.Database
})

async function initDB() {
    const db = await dbPromise;
    const dbb = await dbPromise_Bot_logs;
    const dbu = await dbPromise_Users;
    await db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        is_success INTEGER,
        status_code INTEGER,
        response_time INTEGER,
        status_text TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);
    await dbb.exec(`
        CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);
        await dbu.exec(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT,
        user_pass TEXT,
        user_chat_id INTEGER,
        user_access INTEGER,
        is_active INTEGER NOT NULL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `)
}

initDB();

export function lowerFirstFive(str) {
    return str.slice(0, 5).toLowerCase() + str.slice(5)
}

export async function save_log(url, code, duration, statusText, is_success) {
    const db = await dbPromise;
    await db.run(
        `INSERT INTO logs (url, status_code, response_time, status_text, is_success) VALUES (?, ?, ?, ?, ?)`,
        [url, code, duration, statusText, is_success]
    );
}

export async function save_bot_log(text) {
    const db = await dbPromise_Bot_logs;
    await db.run(
        `INSERT INTO blogs (log) VALUES (?)`,[text]
    )
}

export async function get_logs(field , criterion) {
    const db = await dbPromise;
    if(criterion == 'null'){
        return await db.all(`SELECT * FROM logs WHERE status_code IS NULL`);
    }
    return await db.all(`SELECT * FROM logs WHERE ${field} = ?`, [criterion]);
}

export async function get_bot_logs(){
    const db = await dbPromise_Bot_logs;
    console.table(await db.all(`SELECT * FROM blogs`))
}

export async function id_validator(id) {
    const db = await dbPromise;
    const count_of_ids = await db.get('SELECT COUNT(id) FROM logs');

    let ID = Number(id)
    if(ID > 0 && ID <= count_of_ids['COUNT(id)'] && Number.isInteger(ID)){
        return true
    }else{
        if(count_of_ids['COUNT(id)'] <= 0){
            console.log(chalk.red("The database is empty"))
            return 13
        }
        if(id > count_of_ids['COUNT(id)']){
            console.log(chalk.red("This ID does not exist."))
            return false
        }
    }
}

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


export function is_success_Validator(is_success) {
    let num = Number(is_success)
    if(num >= 0 && num < 2){
        return true
    }else{
        console.log(chalk.red("is_Success out of range"))
    }
}

export async function number_validator(code) {
    if(code == null){
        return true
    }
    
    const num = Number(code)

    if (Number.isNaN(num) || !Number.isInteger(num)) {
        console.log(chalk.red("Number not valid!"))
        return false
    }

    return true
}


export function nul_validator(nul){
    if(nul == 'null'){
        return true
    }else{
        console.log(chalk.red("Invalid Value!"))
        return false
    }
}

export function main_operation_validator(data){
    const Data = Number(data)
    if(Data < 1 || Data > 4 || !Number.isInteger(Data)){
        console.log(chalk.red('Operation number not valid!'))
        return false
    }else{
        return true
    }
}

export function search_operation_validator(data){
    const Data = Number(data)
    if(Data < 1 || Data > 2 || !Number.isInteger(Data)){
        console.log(chalk.red('Database number not valid!'))
        return false
    }else{
        return true
    }
}


export async function add_user(id , pass , access) {
    const password = await hashPassword(pass)

    const db = await dbPromise_Users;
    await db.run(
        `INSERT INTO users (user_name, user_pass, user_access) VALUES (?,?,?)`,[id,password,access]
    )
    console.log(chalk.green("Admin Registerd Successful"))
}


export async function user_id_pass_validator(id, pass, access) {
    const db = await dbPromise_Users;
    const ACCESS = Number(access);

    if (Number.isNaN(ACCESS) || !Number.isInteger(ACCESS) || ACCESS < 0 || ACCESS > 1) {
        console.log(chalk.red("Access must be an integer.(Access must 0 or 1)"));
        return false;
    }

    const existence = await db.get(
        `SELECT * FROM users WHERE user_name = ?`, [id]
    );

    if (existence === undefined) {
        await add_user(id, pass , ACCESS);
        return true;
    } else {
        console.log(chalk.red("This username has already been used."));
        return false;
    }
}


export async function authentication(username, password , chatID) {
    const db = await dbPromise_Users;

    const user = await db.get(
        `SELECT * FROM users WHERE user_name = ?`,
        [username]
    );

    if (!user) {
        return false;
    }

    const vpassword = await verifyPassword(user.user_pass , password);

    if (vpassword) {
        await db.run(
            "UPDATE users SET user_chat_id = ?, is_active = 1 WHERE user_name = ?",[chatID, username]
        )
        return true;
    } else {
        return false;
    }
}


export async function get_active_chatid() {
    const db = await dbPromise_Users;
    const users = await db.all(
        "SELECT * FROM users"
    )

    let active_admin_chatid = [];
    let active_nurmal_chatid = [];
    let total = [];

    for(let i = 0; i < users.length; i++){
        if(users[i].is_active == 1 && users[i].user_access == 1){
            active_admin_chatid.push(users[i].user_chat_id)
        }
        if(users[i].is_active == 1 && users[i].user_access == 0){
            active_nurmal_chatid.push(users[i].user_chat_id)
        }
    }

    total.push(active_admin_chatid , active_nurmal_chatid)

    return total
}




export async function cheach_active_access(chatid) {
    const db = await dbPromise_Users;
    const dbn = await dbPromise;

    const user = await db.get(
        "SELECT * FROM users WHERE user_chat_id = ?",[chatid]
    )

    if(!user){
        return false
    }

    if(user.is_active == 1 && user.user_access == 1){
        const rows = await dbn.all("SELECT * FROM logs");
        fs.writeFileSync(`./logs/logs.json`, JSON.stringify(rows, null, 2));
        return true
    }
}


export const hashPassword = async (password) =>{
    return argon2.hash(
        password,
        {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4
        }
    );
};


export const verifyPassword = async(passwordhash , password) => {
    return await argon2.verify(passwordhash , password);
};

