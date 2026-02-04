import fs from "fs";
import {initDB, dbPromise, dbPromise_Users, dbPromise_Bot_logs} from "./db/init.js"


await initDB();


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




export async function check_active_access(chatid) {
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


