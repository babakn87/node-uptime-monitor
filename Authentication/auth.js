import argon2 from "argon2";
import chalk from "chalk";
import { dbPromise_Users, dbPromise } from "../db/init.js";


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


export async function id_validator(id) {
    const db = await dbPromise;

    const result = await db.get('SELECT MAX(id) as max_id FROM logs'); 
    const maxId = result.max_id || 0;

    let ID = Number(id);

    if (maxId === 0) {
        console.log(chalk.red("The database is empty"));
        return 13; 
    }

    if (Number.isInteger(ID) && ID > 0 && ID <= maxId) {
        const exists = await db.get('SELECT id FROM logs WHERE id = ?', [ID]);
        if(exists) return true;
        
        console.log(chalk.red("This ID has been deleted."));
        return false;
    } else {
        console.log(chalk.red("This ID does not exist."));
        return false;
    }
}