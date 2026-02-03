📘 URL Monitoring & Telegram Alert System

A lightweight yet powerful Node.js-based monitoring tool designed to track website uptime, log response metrics, and send real-time alerts via Telegram.
This project includes a CLI interface, SQLite logging, user authentication, and a Telegram bot with role-based access control.
🚀 Features
🔍 URL Monitoring

    Continuous HTTP/HTTPS monitoring

    Response time measurement

    Status code tracking

    Auto-retry loop

    Real-time terminal output

    Audio alert on failure

📦 Logging System

    SQLite database for persistent logs

    Stores:

        URL

        Status code

        Response time

        Success flag

        Timestamp

    Search logs by:

        ID

        URL

        Status code

        Success state

        Network errors

🤖 Telegram Bot Integration

    Login system with username/password

    Argon2 password hashing

    Role-based access:

        Admin → receives full alerts + can download logs

        User → receives simplified alerts

    Sends alerts when monitored URL goes down

    Sends logs.json  to admins on request

🔐 User Management

    Register new users from CLI

    Access levels:

        0 → Normal user

        1 → Admin

    Chat ID auto-binding after login

    Active user tracking

🎧 Audio Alerts

    Plays alarm sound on downtime

    Supports:

        Windows

        macOS

        Linux

⌨️ Interactive CLI Shortcuts
Key	Action
Ctrl + C	Exit program
Ctrl + U	Change monitored URL
Ctrl + S	Search logs
Ctrl + F	Return to main menu
🛠️ Tech Stack

    Node.js

    SQLite3

    Argon2

    Telegram Bot API

    Socks Proxy Agent

    Chalk

    Readline

    ESM Modules

📁 Project Structure
Code