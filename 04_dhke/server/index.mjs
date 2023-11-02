import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 })

let left
let right

let leftPublicKey
let rightPublicKey

wss.on("connection", (ws) => {
  let getOther
  if (left === undefined) {
    left = ws
    getOther = () => right
  } else if (right === undefined) {
    right = ws
    getOther = () => left
  } else {
    ws.send("chat room full")
    return
  }

  ws.on("message", (data) => {
    const message = data.toString()
    const other = getOther()

    console.log("message is: " + message)

    // send the clients' public keys to the other client
    if (message.charAt(0) === "#") {
      if (other === left) {
        rightPublicKey = message.substring(1)
      } else {
        leftPublicKey = message.substring(1)
      }
      if (other !== undefined) {
        if (other === left) {
          ws.send("#" + leftPublicKey)
          other.send("#" + rightPublicKey)
        } else if (other === right) {
          ws.send("#" + rightPublicKey)
          other.send("#" + leftPublicKey)
        }
      }
    } else {
      if (other === undefined) {
        ws.send("chat partner not connected")
        return
      } 

      other.send(message)
    }
  })
})
