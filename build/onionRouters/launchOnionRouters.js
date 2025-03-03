"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchOnionRouters = void 0;
const simpleOnionRouter_1 = require("./simpleOnionRouter");
const crypto_1 = require("../crypto");
async function launchOnionRouters(n) {
    const promises = [];
    // launch a n onion routers
    for (let index = 0; index < n; index++) {
        //gen rsa key pair for each node
        const { privateKey } = await (0, crypto_1.generateRsaKeyPair)();
        let privateKeyBase64 = await (0, crypto_1.exportPrvKey)(privateKey);
        if (!privateKeyBase64) {
            throw new Error('Failed to generate private key for node ${index}');
        }
        console.log('Starting Onion Router ${index} with a generated private key');
        //start the onion router with node id and private key
        const newPromise = (0, simpleOnionRouter_1.simpleOnionRouter)(index, privateKeyBase64);
        promises.push(newPromise);
    }
    const servers = await Promise.all(promises);
    return servers;
}
exports.launchOnionRouters = launchOnionRouters;
