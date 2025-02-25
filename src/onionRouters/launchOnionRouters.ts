import { simpleOnionRouter } from "./simpleOnionRouter";
import { generateRsaKeyPair, exportPrvKey } from "../crypto";

export async function launchOnionRouters(n: number) {
  const promises = [];

  // launch a n onion routers
  for (let index = 0; index < n; index++) {
    //gen rsa key pair for each node
    const {privateKey} = await generateRsaKeyPair();
    let privateKeyBase64 = await exportPrvKey(privateKey);

    if (!privateKeyBase64) {
      throw new Error('Failed to generate private key for node ${index}');
    }

    console.log('Starting Onion Router ${index} with a generated private key');

    //start the onion router with node id and private key
    const newPromise = simpleOnionRouter(index, privateKeyBase64);
    promises.push(newPromise);
  }

  const servers = await Promise.all(promises);

  return servers;
}
