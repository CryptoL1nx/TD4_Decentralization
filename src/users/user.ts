import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  //2.2 user GET routes
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  // implement the status route
  _user.get("/status", (req, res) => {
    return res.send("live");
  });

  //route to get the last received message
  _user.get("/getLastReceivedMessage", (req, res) => {
    return res.json({result: lastReceivedMessage});
  });

  //route to get to the last sent message
  _user.get("/getLastSentMessage", (req, res) => {
    return res.json({result: lastSentMessage});
  });

  //route to receive messages
  _user.post("/receiveMessage", (req, res) => {
    const {message} = req.body;

    if (!message) {
      return res.status(400).json({error : "Missing message"});
    }

    lastReceivedMessage = message;
    return res.json({status : "Message received"});
  });

  //route to send messages
  _user.post("/sendMessage", (req, res) => {
    const {message} = req.body;

    if (!message) {
      return res.status(400).json({error : "Missing message"});
    };

    lastSentMessage = message;
    res.json({status: "Message sent"});
  });


  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
