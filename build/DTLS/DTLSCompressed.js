var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { ContentType } from "../TLS/ContentType";
import { ProtocolVersion } from "../TLS/ProtocolVersion";
import { TLSStruct } from "../TLS/TLSStruct";
import * as TypeSpecs from "../TLS/TypeSpecs";
import { DTLSPlaintext } from "./DTLSPlaintext";
var DTLSCompressed = /** @class */ (function (_super) {
    __extends(DTLSCompressed, _super);
    function DTLSCompressed(type, version, epoch, sequence_number, fragment) {
        if (version === void 0) { version = new ProtocolVersion(); }
        var _this = _super.call(this, DTLSCompressed.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.fragment = fragment;
        return _this;
    }
    DTLSCompressed.createEmpty = function () {
        return new DTLSCompressed(null, null, null, null, null);
    };
    /**
     * Compresses the given plaintext packet
     * @param packet - The plaintext packet to be compressed
     * @param compressor - The compressor function used to compress the given packet
     */
    DTLSCompressed.compress = function (packet, compressor) {
        return new DTLSCompressed(packet.type, packet.version, packet.epoch, packet.sequence_number, compressor(packet.fragment));
    };
    /**
     * Decompresses this packet into a plaintext packet
     * @param decompressor - The decompressor function used to decompress this packet
     */
    DTLSCompressed.prototype.decompress = function (decompressor) {
        return new DTLSPlaintext(this.type, this.version, this.epoch, this.sequence_number, decompressor(this.fragment));
    };
    /**
     * Computes the MAC header representing this packet. The MAC header is the input buffer of the MAC calculation minus the actual fragment buffer.
     */
    DTLSCompressed.prototype.computeMACHeader = function () {
        return (new MACHeader(this.epoch, this.sequence_number, this.type, this.version, this.fragment.length)).serialize();
    };
    DTLSCompressed.__spec = {
        type: ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion),
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        // length field is implied in the variable length vector
        fragment: TypeSpecs.define.Buffer(0, 1024 + Math.pow(2, 14)),
    };
    DTLSCompressed.spec = TypeSpecs.define.Struct(DTLSCompressed);
    return DTLSCompressed;
}(TLSStruct));
export { DTLSCompressed };
var MACHeader = /** @class */ (function (_super) {
    __extends(MACHeader, _super);
    function MACHeader(epoch, sequence_number, type, version, fragment_length) {
        var _this = _super.call(this, MACHeader.__spec) || this;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.type = type;
        _this.version = version;
        _this.fragment_length = fragment_length;
        return _this;
    }
    MACHeader.createEmpty = function () {
        return new MACHeader(null, null, null, null, null);
    };
    MACHeader.__spec = {
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        type: ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion),
        fragment_length: TypeSpecs.uint16,
    };
    return MACHeader;
}(TLSStruct));
export { MACHeader };
