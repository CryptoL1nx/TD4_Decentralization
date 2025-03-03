import { webcrypto } from "crypto";

// #############
// ### Utils ###
// #############

// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  var buff = Buffer.from(base64, "base64");
  return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}

// ################
// ### RSA keys ###
// ################

const ENCRYPTION_ALGORITHM_NAME = "RSA-OAEP";

// Generates a pair of private / public RSA keys
type GenerateRsaKeyPair = {
  publicKey: webcrypto.CryptoKey;
  privateKey: webcrypto.CryptoKey;
};
export async function generateRsaKeyPair(): Promise<GenerateRsaKeyPair> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM_NAME,
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return { publicKey: publicKey, privateKey: privateKey };
}

// Export a crypto public key to a base64 string format
export async function exportPubKey(key: webcrypto.CryptoKey): Promise<string> {
  return arrayBufferToBase64(await crypto.subtle.exportKey("spki", key));
}

// Export a crypto private key to a base64 string format
export async function exportPrvKey(
  key: webcrypto.CryptoKey | null
): Promise<string | null> {
  if (key === null) return null;
  return arrayBufferToBase64(await crypto.subtle.exportKey("pkcs8", key));
}

// Import a base64 string public key to its native format
export async function importPubKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const key = await crypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(strKey),
    {
      name: ENCRYPTION_ALGORITHM_NAME,
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  return key;
}

// Import a base64 string private key to its native format
export async function importPrvKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(strKey),
    {
      name: ENCRYPTION_ALGORITHM_NAME,
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  return key;
}

// Encrypt a message using an RSA public key
export async function rsaEncrypt(
  b64Data: string,
  strPublicKey: string
): Promise<string> {
  const publicKey = await importPubKey(strPublicKey);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM_NAME,
    },
    publicKey,
    base64ToArrayBuffer(b64Data)
  );

  return arrayBufferToBase64(encryptedData);
}

// Decrypts a message using an RSA private key
export async function rsaDecrypt(
  data: string,
  privateKey: webcrypto.CryptoKey
): Promise<string> {
  const encryptedData = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM_NAME,
    },
    privateKey,
    base64ToArrayBuffer(data)
  );

  return arrayBufferToBase64(encryptedData);
}

// ######################
// ### Symmetric keys ###
// ######################

// Generates a random symmetric key
export async function createRandomSymmetricKey(): Promise<webcrypto.CryptoKey> {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true, // whether the key is extractable (i.e., can be used in exportKey)
    ["encrypt", "decrypt"]
  );
  return key;
}

// Export a crypto symmetric key to a base64 string format
export async function exportSymKey(key: webcrypto.CryptoKey): Promise<string> {
  return arrayBufferToBase64(await crypto.subtle.exportKey("raw", key));
}

// Import a base64 string format to its crypto native format
export async function importSymKey(
  strKey: string
): Promise<webcrypto.CryptoKey> {
  const key = await crypto.subtle.importKey(
    "raw",
    base64ToArrayBuffer(strKey),
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return key;
}

// Encrypt a message using a symmetric key
export async function symEncrypt(
  key: webcrypto.CryptoKey,
  data: string
): Promise<string> {
  // Assuming `data` is a string that needs to be encrypted
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // Generate an IV
  // Note: Here the IV is a fixed value for simplicity
  const iv = new Uint8Array(16);

  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    encodedData
  );

  return arrayBufferToBase64(encryptedData);
}

// Decrypt a message using a symmetric key
export async function symDecrypt(
  strKey: string,
  encryptedData: string
): Promise<string> {
  const key = await importSymKey(strKey);

  // Generate an IV
  // Note: Here the IV is a fixed value for simplicity
  const iv = new Uint8Array(16);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    base64ToArrayBuffer(encryptedData)
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}