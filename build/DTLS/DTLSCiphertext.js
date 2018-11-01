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
var DTLSCiphertext = /** @class */ (function (_super) {
    __extends(DTLSCiphertext, _super);
    function DTLSCiphertext(type, version, epoch, sequence_number, fragment) {
        if (version === void 0) { version = new ProtocolVersion(); }
        var _this = _super.call(this, DTLSCiphertext.__spec) || this;
        _this.type = type;
        _this.version = version;
        _this.epoch = epoch;
        _this.sequence_number = sequence_number;
        _this.fragment = fragment;
        return _this;
    }
    DTLSCiphertext.createEmpty = function () {
        return new DTLSCiphertext(null, null, null, null, null);
    };
    DTLSCiphertext.__spec = {
        type: ContentType.__spec,
        version: TypeSpecs.define.Struct(ProtocolVersion),
        epoch: TypeSpecs.uint16,
        sequence_number: TypeSpecs.uint48,
        // length field is implied in the variable length vector
        fragment: TypeSpecs.define.Buffer(0, 2048 + Math.pow(2, 14)),
    };
    DTLSCiphertext.spec = TypeSpecs.define.Struct(DTLSCiphertext);
    return DTLSCiphertext;
}(TLSStruct));
export { DTLSCiphertext };
