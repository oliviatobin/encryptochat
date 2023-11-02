import { WebSocketServer } from "ws";
import crypto, { generateKeyPairSync } from "crypto"

const wss = new WebSocketServer({ port: 3000 })

let left
let right

// generate server keypair
const { publicKey: publicKeyServer, privateKey: privateKeyServer } = generateKeyPairSync('rsa', {
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

let leftPublicKey
let rightPublicKey

wss.on("connection", (ws) => {
  let getOther
  if (left === undefined) {
    left = ws
    getOther = () => right
    ws.send("#" + publicKeyServer)
  } else if (right === undefined) {
    right = ws
    getOther = () => left
    ws.send("#" + publicKeyServer)
  } else {
    ws.send("chat room full")
    return
  }

  ws.on("message", (data) => {
    const message = data.toString()
    const other = getOther()

    // store the clients' public keys
    if (message.charAt(0) === "#") {
      if (other === left) {
        rightPublicKey = message.substring(1)
      } else {
        leftPublicKey = message.substring(1)
      }
    } else {
      if (other === undefined) {
        ws.send("chat partner not connected")
        return
      }

      console.log(message)

      // decrypt the message from sender
      var plainText = crypto.privateDecrypt({
        key: privateKeyServer,
        passphrase: "",
      }, Buffer.from(message, "base64"));

      // reencrypt for sendee
      let encryptedMessage
      if (other === right) {
        encryptedMessage = crypto.publicEncrypt(rightPublicKey.toString(), plainText)
      } else {
        encryptedMessage = crypto.publicEncrypt(leftPublicKey.toString(), plainText)
      }
      other.send(encryptedMessage.toString("base64"))
    }
  })
})
