![NUM Logo](assets/iamge.png)

# 🌐 Advanced URL Monitoring System (NUM)

A robust, modular Command Line Interface (CLI) tool built with Node.js to monitor website uptime and performance. It features real-time monitoring, database logging, and a Telegram Bot integration for remote management and alerts.

## ✨ Key Features

- **Real-time Monitoring:** Tracks HTTP status codes and response times.
- **Interactive CLI:** Beautifully styled terminal interface using `chalk`.
- **Audio Alerts:** Plays a physical alarm sound (`.wav`) when a network error or downtime occurs.
- **Telegram Bot Integration:**
    - Receive downtime alerts directly on Telegram.
    - Secure 2-step login (Username/Password) via the bot.
    - Download full activity logs (`logs.json`) remotely.
- **Persistent Storage (SQLite):**
    - Stores monitoring history, bot activity logs, and user credentials.
    - Advanced database search functionality (by ID, URL, Status Code, etc.).
- **Keyboard Shortcuts:** Control the app on-the-fly without restarting.
- **Security:** Passwords are encrypted using the **Argon2** hashing algorithm.

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- A Telegram Bot Token (obtainable from [@BotFather](https://t.me/botfather))

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/babakn87/node-uptime-monitor.git
   cd node-uptime-monitor
   ```
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Environment Setup:**
   On the first run, the app will prompt you for your Telegram Token and automatically create a .env file. Alternatively, you can create it manually:
   ```bash
   TOKEN=your_telegram_bot_token
   ```

## 🚀 Usage

Start the application by running:

    ```bash
    node app.js
    ```
    
**⌨️ Keyboard Shortcuts (Live Monitoring Mode)**

    ```bash
    CTRL+U => Change the URL being monitored
    CTRL+S => Open Database Search menu
    CTRL+F => Return to the Main Menu
    CTRL+C => Stop and Exit the program
    ```
    
**🤖 Telegram Bot Commands**

To use the bot, you must first register an admin user through the CLI (Option 3 in the main menu).

    ```bash
    /login => Authenticate using your CLI-registered credentials.
    /getnd => Get the latest report database as a JSON file (authenticated users with administrator access only).
    ```

**🗄 Database Structure**

The system automatically manages three SQLite databases:

1.monitoring_logs.db: Stores URL uptime data.

2.Users.db: Manages user accounts and access levels (Admin/Normal).

3.telegramBot_logs.db: Records all bot interactions.

**⚠️ Audio Alert Note**

The system uses native OS players for alerts:

Windows: PowerShell Media Player

macOS: afplay

Linux: aplay (ensure it is installed)


Developed by **Bobby**
