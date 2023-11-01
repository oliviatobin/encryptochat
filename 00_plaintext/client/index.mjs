import WebSocket from "ws";
import { createInterface } from "node:readline"

const ws = new WebSocket("ws://localhost:3000")

ws.on("message", (data) => {
    const message = data.toString()
    console.log(message)
})

for await (const line of createInterface({ input: process.stdin })) {
    ws.send(line)
}