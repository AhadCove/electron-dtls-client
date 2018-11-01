import * as crypto from "crypto";
function encryptNative(mode, key, iv, plaintext, additionalData, authTagLength) {
    // prepare encryption
    var algorithm = "aes-" + key.length * 8 + "-" + mode;
    // @ts-ignore The 4th parameter is available starting in NodeJS 10+
    var cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: authTagLength });
    // @ts-ignore The 2nd parameter is available starting in NodeJS 10+
    cipher.setAAD(additionalData, { plaintextLength: plaintext.length });
    // do encryption
    var ciphertext = cipher.update(plaintext);
    cipher.final();
    var auth_tag = cipher.getAuthTag();
    return { ciphertext: ciphertext, auth_tag: auth_tag };
}
function decryptNative(mode, key, iv, ciphertext, additionalData, authTag) {
    // prepare decryption
    var algorithm = "aes-" + key.length * 8 + "-" + mode;
    // @ts-ignore The 4th parameter is available starting in NodeJS 10+
    var decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: authTag.length });
    decipher.setAuthTag(authTag);
    // @ts-ignore The 2nd parameter is available starting in NodeJS 10+
    decipher.setAAD(additionalData, { plaintextLength: ciphertext.length });
    // do decryption
    var plaintext = decipher.update(ciphertext);
    // verify decryption
    var auth_ok = false;
    try {
        decipher.final();
        auth_ok = true;
    }
    catch (e) { /* nothing to do */ }
    return { plaintext: plaintext, auth_ok: auth_ok };
}
var importedCCM;
var importedGCM;
var nativeCCM;
var nativeGCM;
// We can use the native methods
nativeCCM = {
    encrypt: encryptNative.bind(undefined, "ccm"),
    decrypt: decryptNative.bind(undefined, "ccm"),
};
nativeGCM = {
    encrypt: encryptNative.bind(undefined, "gcm"),
    decrypt: decryptNative.bind(undefined, "gcm"),
};
export var ccm = importedCCM || nativeCCM;
export var gcm = importedGCM || nativeGCM;
