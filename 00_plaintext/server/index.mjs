import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 })

let left
let right

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
    console.log(message)
    const other = getOther()
    if (other === undefined) {
      ws.send("chat partner not connected")
      return
    }
    other.send(message)
  })
})

