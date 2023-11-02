import WebSocket from "ws";
import crypto, { createDiffieHellman, createDiffieHellmanGroup } from "crypto"
import { createInterface } from "node:readline"

let otherKey

// generate client keypair
const client = createDiffieHellmanGroup('modp16')
const clientKey = client.generateKeys("hex")

const ws = new WebSocket("ws://localhost:3000")

ws.on("open", () => {
    // send the client's public key
    ws.send("#" + clientKey)
})

let clientSecret

ws.on("message", (data) => {
    const message = data.toString()
    if (message.charAt(0) === "#") {
        // save the other client's public key
        otherKey = data.toString().substring(1)
        clientSecret = client.computeSecret(otherKey, "hex", "hex")
    } else {
        // decrypt the message sent from other client
        const decipher = crypto.createDecipher("aes128", clientSecret)
        let plainText = decipher.update(message, "hex", "utf8")
        plainText += decipher.final("utf8")
        console.log(plainText)
    }
})

for await (const line of createInterface({ input: process.stdin })) {
    // encrypt client's message with the other client's public key
    if (otherKey === undefined) {
        continue
    }

    const cipher = crypto.createCipher("aes128", clientSecret)
    let message = cipher.update(line, "utf8", "hex")
    message += cipher.final("hex")
    ws.send(message)
}
