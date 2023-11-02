import { WebSocketServer } from "ws";
import crypto from "crypto"
import { get } from "http";

const wss = new WebSocketServer({ port: 3000 })

let left
let right
let passwordLeft
let passwordRight

wss.on("connection", (ws) => {
  let getOther
  let getPassword
  let getOtherPassword
  if (left === undefined) {
    left = ws
    passwordLeft = "#" + Math.random().toString(36).substring(2);
    getOther = () => right
    getPassword = () => passwordLeft
    getOtherPassword = () => passwordRight
    ws.send(passwordLeft)
  } else if (right === undefined) {
    right = ws
    passwordRight = "#" + Math.random().toString(36).substring(2);
    getOther = () => left
    getPassword = () => passwordRight
    getOtherPassword = () => passwordLeft
    ws.send(passwordRight)
  } else {
    ws.send("chat room full")
    return
  }
  ws.on("message", (data) => {
    const message = data.toString()
    console.log(message)
    const other = getOther()
    if (other === undefined) {
      ws.send("chat partner not connected")
      return
    }

    // decrypt the message from sender
    const password = getPassword()
    const decipher = crypto.createDecipher("aes128", password)
    let plainText = decipher.update(message, "hex", "utf8")
    plainText += decipher.final("utf8")

    // reencrypt for sendee
    const otherPassword = getOtherPassword()
    const cipher = crypto.createCipher("aes128", otherPassword)
    let encryptedMessage = cipher.update(plainText, "utf8", "hex")
    encryptedMessage += cipher.final("hex")
    console.log(encryptedMessage)
    other.send(encryptedMessage)
  })
})

