import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { BASE_USER_PORT, REGISTRY_PORT } from "../config";
import { exportSymKey, symEncrypt, createRandomSymmetricKey, rsaEncrypt, importPubKey } from "../crypto";

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  // ✅ Status route
  _user.get("/status", (req, res) => {
    return res.send("live");
  });

  // ✅ GET last received message
  _user.get("/getLastReceivedMessage", (req, res) => {
    return res.json({ result: lastReceivedMessage });
  });

  // ✅ GET last sent message
  _user.get("/getLastSentMessage", (req, res) => {
    return res.json({ result: lastSentMessage });
  });

  // ✅ POST /message - Receive messages
  _user.post("/message", (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    lastReceivedMessage = message;
    return res.json({ status: "Message received" });
  });

  // ✅ POST /sendMessage - Send a message through the network
  _user.post("/sendMessage", async (req, res) => {
    try {
      const { message, destinationUserId } = req.body;

      if (!message || !destinationUserId) {
        return res.status(400).json({ error: "Missing message or destinationUserId" });
      }

      // ✅ Get nodes from the registry
      const registryResponse = await axios.get<{ nodes: { nodeId: number; pubKey: string }[] }>(
        `http://localhost:${REGISTRY_PORT}/getNodeRegistry`
      );
      const nodes = registryResponse.data.nodes;
      
      if (nodes.length < 3) {
        return res.status(400).json({ error: "Not enough nodes available" });
      }

      // ✅ Select 3 random nodes for the circuit
      const circuit = nodes.sort(() => 0.5 - Math.random()).slice(0, 3);

      // ✅ Encrypt the message layer by layer
      let encryptedMessage = message;
      for (const node of circuit.reverse()) {
        const symKey = await createRandomSymmetricKey();
        const symEncrypted = await symEncrypt(symKey, encryptedMessage);
        const encryptedSymKey = await rsaEncrypt(await exportSymKey(symKey), node.pubKey);

        // ✅ Format: encryptedSymKey + encryptedMessage
        encryptedMessage = `${encryptedSymKey}:${symEncrypted}`;
      }

      // ✅ Send the fully encrypted message to the first node
      await axios.post(`http://localhost:${circuit[0].nodeId}/message`, { message: encryptedMessage });

      lastSentMessage = message;
      return res.json({ status: "Message sent through network" });

    } catch (error) {
      console.error("Error in sendMessage:", error);
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ✅ Start the User Server
  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(`User ${userId} is listening on port ${BASE_USER_PORT + userId}`);
  });

  return server;
}
