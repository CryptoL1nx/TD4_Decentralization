"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
async function simpleOnionRouter(nodeId, privateKeyBase64) {
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    //convert private key from base64 to CryptoKey
    const privateKey = await (0, crypto_1.importPrvKey)(privateKeyBase64);
    // 2.1 Nodes GET Routes to store last received messages and destination
    let lastReceivedEncryptedMessage = null;
    let lastReceivedDecryptedMessage = null;
    let lastMessageDestination = null;
    // 1.1 implement the status route
    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });
    //Route to get to the last received encrypted message
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        res.json({ result: lastReceivedEncryptedMessage });
    });
    //route last received decrypted message
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        res.json({ result: lastReceivedDecryptedMessage });
    });
    //route last message destination
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        res.json({ result: lastMessageDestination });
    });
    //Route to receive and process messages
    //doit etre async pour la fonction await
    onionRouter.post("/message", async (req, res) => {
        try {
            const { message, destination } = req.body;
            if (!message || !destination) {
                return res.status(400).json({ error: "Missing message or destination" });
            }
            //store received encrypted message
            lastReceivedEncryptedMessage = message;
            //use async/await for decryption
            lastReceivedDecryptedMessage = await (0, crypto_1.rsaDecrypt)(message, privateKey);
            //store destination
            lastMessageDestination = destination;
            return res.json({ status: "Message received and processed" });
        }
        catch (error) {
            console.error("Decryption error:", error);
            return res.status(500).json({ error: "Decryption failed" });
        }
        //ensures a fallback response : pour pas d'erreur quand on compile typescript
        //return res.status(500).json({error: "Unexpected error"});
    });
    //}
    const server = onionRouter.listen(config_1.BASE_ONION_ROUTER_PORT + nodeId, () => {
        console.log(`Onion router ${nodeId} is listening on port ${config_1.BASE_ONION_ROUTER_PORT + nodeId}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
