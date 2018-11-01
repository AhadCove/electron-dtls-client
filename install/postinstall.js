// @ts-check

/**
 * This installs the node-aead-crypto module on platforms with NodeJS < 10
 * On NodeJS 10, the polyfilled functionality is supported natively
 */

// The desired version of node-aead-crypto
const desiredVersion = "^1.1.3";

const semver = require("semver");
// skip the installation on NodeJS 10+
console.log("  Version >= 10, skipping installation of node-aead-crypto");
process.exit(0);
