import WebSocket from "ws";
import crypto, { generateKeyPairSync } from "crypto"
import { createInterface } from "node:readline"

let otherKey

// generate client keypair
const { publicKey: publicKeyClient, privateKey: privateKeyClient } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
    },
    privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
    },
});

const ws = new WebSocket("ws://localhost:3000")

ws.on("open", () => {
    // send the client's public key
    ws.send("#" + publicKeyClient)
})

ws.on("message", (data) => {
    const message = data.toString()
    if (message.charAt(0) === "#") {
        // save the other client's public key
        otherKey = data.toString().substring(1)
    } else {
        // decrypt the message sent from other client
        var plainText = crypto.privateDecrypt({
            key: privateKeyClient,
            passphrase: "",
          }, Buffer.from(message, "base64"));
        console.log(plainText.toString())
    }
})

for await (const line of createInterface({ input: process.stdin })) {
    // encrypt client's message with the other client's public key
    if (otherKey === undefined) {
        continue
    }
    const encryptedMessage = crypto.publicEncrypt(otherKey.toString(), line)
    ws.send(encryptedMessage.toString("base64"))
}
