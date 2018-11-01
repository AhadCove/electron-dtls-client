import { CipherSuites } from "../DTLS/CipherSuites";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { PRF } from "./PRF";
import * as TypeSpecs from "./TypeSpecs";
export var CompressionMethod;
(function (CompressionMethod) {
    CompressionMethod[CompressionMethod["null"] = 0] = "null";
})(CompressionMethod || (CompressionMethod = {}));
// tslint:disable-next-line:no-namespace
(function (CompressionMethod) {
    CompressionMethod.spec = TypeSpecs.define.Enum("uint8", CompressionMethod);
})(CompressionMethod || (CompressionMethod = {}));
var master_secret_length = 48;
var client_random_length = 32;
var server_random_length = 32;
var ConnectionState = /** @class */ (function () {
    function ConnectionState() {
        // This doesn't seem to be used:
        // constructor(values?: Partial<ConnectionState>) {
        // 	if (values) {
        // 		for (const [key, value] of entries(values)) {
        // 			if (this.hasOwnProperty(key)) (this as any)[key] = value;
        // 		}
        // 	}
        // }
        this.entity = "client";
        this.cipherSuite = CipherSuites.TLS_NULL_WITH_NULL_NULL;
        this.protocolVersion = new ProtocolVersion(~1, ~0); // default to DTLSv1.0 during handshakes
        this.compression_algorithm = CompressionMethod.null;
    }
    Object.defineProperty(ConnectionState.prototype, "Cipher", {
        get: function () {
            if (this._cipher == undefined) {
                this._cipher = this.cipherSuite.specifyCipher(this.key_material, this.entity);
            }
            return this._cipher;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConnectionState.prototype, "Decipher", {
        get: function () {
            if (this._decipher == undefined) {
                this._decipher = this.cipherSuite.specifyDecipher(this.key_material, this.entity);
            }
            return this._decipher;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Compute the master secret from a given premaster secret
     * @param preMasterSecret - The secret used to calculate the master secret
     * @param clientHelloRandom - The random data from the client hello message
     * @param serverHelloRandom - The random data from the server hello message
     */
    ConnectionState.prototype.computeMasterSecret = function (preMasterSecret) {
        this.master_secret = PRF[this.cipherSuite.prfAlgorithm](preMasterSecret.serialize(), "master secret", Buffer.concat([this.client_random, this.server_random]), master_secret_length);
        // now we can compute the key material
        this.computeKeyMaterial();
    };
    /**
     * Calculates the key components
     */
    ConnectionState.prototype.computeKeyMaterial = function () {
        var keyBlock = PRF[this.cipherSuite.prfAlgorithm](this.master_secret, "key expansion", Buffer.concat([this.server_random, this.client_random]), 2 * (this.cipherSuite.MAC.keyAndHashLength + this.cipherSuite.Cipher.keyLength + this.cipherSuite.Cipher.fixedIvLength));
        var offset = 0;
        function read(length) {
            var ret = keyBlock.slice(offset, offset + length);
            offset += length;
            return ret;
        }
        this.key_material = {
            client_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
            server_write_MAC_key: read(this.cipherSuite.MAC.keyAndHashLength),
            client_write_key: read(this.cipherSuite.Cipher.keyLength),
            server_write_key: read(this.cipherSuite.Cipher.keyLength),
            client_write_IV: read(this.cipherSuite.Cipher.fixedIvLength),
            server_write_IV: read(this.cipherSuite.Cipher.fixedIvLength),
        };
    };
    return ConnectionState;
}());
export { ConnectionState };
