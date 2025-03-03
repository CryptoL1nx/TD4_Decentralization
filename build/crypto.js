"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symDecrypt = exports.symEncrypt = exports.importSymKey = exports.exportSymKey = exports.createRandomSymmetricKey = exports.rsaDecrypt = exports.rsaEncrypt = exports.importPrvKey = exports.importPubKey = exports.exportPrvKey = exports.exportPubKey = exports.generateRsaKeyPair = void 0;
const crypto_1 = require("crypto");
// #############
// ### Utils ###
// #############
// Function to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString("base64");
}
// Function to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
    var buff = Buffer.from(base64, "base64");
    return buff.buffer.slice(buff.byteOffset, buff.byteOffset + buff.byteLength);
}
async function generateRsaKeyPair() {
    return await crypto_1.webcrypto.subtle.generateKey({ name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["encrypt", "decrypt"]);
}
exports.generateRsaKeyPair = generateRsaKeyPair;
// Export a crypto public key to a base64 string format
async function exportPubKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey("spki", key);
    return arrayBufferToBase64(exported);
}
exports.exportPubKey = exportPubKey;
// Export a crypto private key to a base64 string format
async function exportPrvKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey("pkcs8", key);
    return arrayBufferToBase64(exported);
}
exports.exportPrvKey = exportPrvKey;
// Import a base64 string public key to its native format
async function importPubKey(strKey) {
    return await crypto_1.webcrypto.subtle.importKey("spki", base64ToArrayBuffer(strKey), { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
}
exports.importPubKey = importPubKey;
// Import a base64 string private key to its native format
async function importPrvKey(strKey) {
    return await crypto_1.webcrypto.subtle.importKey("pkcs8", base64ToArrayBuffer(strKey), { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
}
exports.importPrvKey = importPrvKey;
// Encrypt a message using an RSA public key
async function rsaEncrypt(message, publicKey) {
    const encrypted = await crypto_1.webcrypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, Buffer.from(message));
    return arrayBufferToBase64(encrypted);
}
exports.rsaEncrypt = rsaEncrypt;
// Decrypts a message using an RSA private key
async function rsaDecrypt(encryptedMessage, privateKey) {
    const decrypted = await crypto_1.webcrypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, base64ToArrayBuffer(encryptedMessage));
    return Buffer.from(decrypted).toString();
}
exports.rsaDecrypt = rsaDecrypt;
// ######################
// ### Symmetric keys ###
// ######################
// Generates a random symmetric key
async function createRandomSymmetricKey() {
    return await crypto_1.webcrypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
exports.createRandomSymmetricKey = createRandomSymmetricKey;
// Export a crypto symmetric key to a base64 string format
async function exportSymKey(key) {
    const exported = await crypto_1.webcrypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(exported);
}
exports.exportSymKey = exportSymKey;
// Import a base64 string format to its crypto native format
async function importSymKey(strKey) {
    return await crypto_1.webcrypto.subtle.importKey("raw", base64ToArrayBuffer(strKey), { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}
exports.importSymKey = importSymKey;
// Encrypt a message using a symmetric key
async function symEncrypt(key, data) {
    const iv = crypto_1.webcrypto.getRandomValues(new Uint8Array(12)); // 12-byte IV
    const encodedData = new TextEncoder().encode(data);
    const encrypted = await crypto_1.webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encodedData);
    // Return IV + encrypted message in Base64
    return arrayBufferToBase64(iv) + ":" + arrayBufferToBase64(encrypted);
}
exports.symEncrypt = symEncrypt;
// Decrypt a message using a symmetric key
async function symDecrypt(key, encryptedData) {
    try {
        const [ivBase64, encryptedBase64] = encryptedData.split(":");
        if (!ivBase64 || !encryptedBase64) {
            throw new Error("Invalid encrypted data format");
        }
        const iv = base64ToArrayBuffer(ivBase64);
        const encrypted = base64ToArrayBuffer(encryptedBase64);
        const decrypted = await crypto_1.webcrypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, key, encrypted);
        return new TextDecoder().decode(decrypted);
    }
    catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed");
    }
}
exports.symDecrypt = symDecrypt;
