import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import {rsaDecrypt, importPrvKey} from "../crypto";

export async function simpleOnionRouter(nodeId: number, privateKeyBase64: string) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());
  const privateKey = await importPrvKey(privateKeyBase64);

  // 2.1 Nodes GET Routes to store last received messages and destination
  let lastReceivedEncryptedMessage : string | null = null;
  let lastReceivedDecryptedMessage : string | null = null;
  let lastMessageDestination: number | null = null;

  // 1.1 implement the status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  //Route to get to the last received encrypted message
  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    res.json({result : lastReceivedEncryptedMessage});
  });

  //route last received decrypted message
  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    res.json({result : lastReceivedDecryptedMessage});
  });

  //route last message destination
  onionRouter.get("/getLastMessageDestination", (req, res) => {
    res.json({result : lastMessageDestination});
  });


  //Route to receive and process messages
  onionRouter.post("/message", (req, res) => {
    const {message, destination} = req.body;

    if (!message || !destination) {
      return res.status(400).json({error: "Missing message or destination"});
    }

    //store received encrypted message
    lastReceivedEncryptedMessage = message;

    try{
      //decrypt
      lastReceivedDecryptedMessage = await rsaDecrypt(message, privateKey);
    } catch (error) {
      return res.status(500).json({error: "Decryption failed"});
    }
   
    // store destination
    lastMessageDestination = destination;
    
    res.json({status: "Message received and processed"});
  });

  }

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
