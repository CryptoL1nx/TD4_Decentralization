"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const nodes = []; // In-memory storage for registered nodes
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    // TODO implement the status route
    _registry.get("/status", (req, res) => {
        res.send("live");
    });
    // ✅ POST /registerNode - Allow nodes to register themselves
    _registry.post("/registerNode", (req, res) => {
        const { nodeId, pubKey } = req.body;
        if (!nodeId || !pubKey) {
            return res.status(400).json({ error: "Missing nodeId or pubKey" });
        }
        // Register the node
        nodes.push({ nodeId, pubKey });
        return res.json({ status: "Node registered successfully" });
    });
    // ✅ GET /getNodeRegistry - Retrieve registered nodes
    _registry.get("/getNodeRegistry", (req, res) => {
        return res.json({ nodes });
    });
    // Start the registry server
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`Registry is running on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
