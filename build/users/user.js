"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const config_1 = require("../config");
const crypto_1 = require("../crypto");
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    let lastReceivedMessage = null;
    let lastSentMessage = null;
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
            const registryResponse = await axios_1.default.get(`http://localhost:${config_1.REGISTRY_PORT}/getNodeRegistry`);
            const nodes = registryResponse.data.nodes;
            if (nodes.length < 3) {
                return res.status(400).json({ error: "Not enough nodes available" });
            }
            // ✅ Select 3 random nodes for the circuit
            const circuit = nodes.sort(() => 0.5 - Math.random()).slice(0, 3);
            // ✅ Encrypt the message layer by layer
            let encryptedMessage = message;
            for (const node of circuit.reverse()) {
                const symKey = await (0, crypto_1.createRandomSymmetricKey)();
                const symEncrypted = await (0, crypto_1.symEncrypt)(symKey, encryptedMessage);
                const encryptedSymKey = await (0, crypto_1.rsaEncrypt)(await (0, crypto_1.exportSymKey)(symKey), await (0, crypto_1.importPubKey)(node.pubKey));
                // ✅ Format: encryptedSymKey + encryptedMessage
                encryptedMessage = `${encryptedSymKey}:${symEncrypted}`;
            }
            // ✅ Send the fully encrypted message to the first node
            await axios_1.default.post(`http://localhost:${circuit[0].nodeId}/message`, { message: encryptedMessage });
            lastSentMessage = message;
            return res.json({ status: "Message sent through network" });
        }
        catch (error) {
            console.error("Error in sendMessage:", error);
            return res.status(500).json({ error: "Failed to send message" });
        }
    });
    // ✅ Start the User Server
    const server = _user.listen(config_1.BASE_USER_PORT + userId, () => {
        console.log(`User ${userId} is listening on port ${config_1.BASE_USER_PORT + userId}`);
    });
    return server;
}
exports.user = user;
