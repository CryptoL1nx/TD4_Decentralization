import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodes: Node[] = []; // In-memory storage for registered nodes

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  // TODO implement the status route
  _registry.get("/status", (req:Request, res:Response) => {
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
  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is running on port ${REGISTRY_PORT}`);
  });

  return server;
}