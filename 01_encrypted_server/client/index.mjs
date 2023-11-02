import WebSocket from "ws";
import crypto from "crypto"
import { createInterface } from "node:readline"

const ws = new WebSocket("ws://localhost:3000")

let password

ws.on("message", (data) => {
    if (data.toString().charAt(0) === "#") {
        password = data.toString()
    } else {
        const message = data.toString()
        const decipher = crypto.createDecipher("aes128", password)
        let plainText = decipher.update(message, "hex", "utf8")
        plainText += decipher.final("utf8")
        console.log(plainText)
    }
})

for await (const line of createInterface({ input: process.stdin })) {
    const cipher = crypto.createCipher("aes128", password)
    let message = cipher.update(line, "utf8", "hex")
    message += cipher.final("hex")
    ws.send(message)
}