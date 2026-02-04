import sqlite3 from "sqlite3";
import { open } from "sqlite";



export const dbPromise = open({
    filename: "./db/data/monitoring_logs.db",
    driver: sqlite3.Database
});

export const dbPromise_Users = open({
    filename: "./db/data/Users.db",
    driver: sqlite3.Database
})

export const dbPromise_Bot_logs = open({
    filename: "./db/data/telegramBot_logs.db",
    driver: sqlite3.Database
})


export async function initDB() {
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