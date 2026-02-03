import { exec } from "child_process";

export function playSound(filePath) {
    const platform = process.platform;

    let command;

    if (platform === "win32") {
        command = `powershell -c (New-Object Media.SoundPlayer '${filePath}').PlaySync();`;
    } 
    else if (platform === "darwin") {
        command = `afplay "${filePath}"`;
    } 
    else if (platform === "linux") {
        command = `aplay "${filePath}"`;
    } 
    else {
        throw new Error("Operating system not supported");
    }

    exec(command, (error) => {
        if (error) {
            console.error("Audio playback error:", error.message);
        }
    });
}

