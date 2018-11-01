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
import { TLSStruct } from "./TLSStruct";
import * as TypeSpecs from "./TypeSpecs";
export var ChangeCipherSpecTypes;
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes[ChangeCipherSpecTypes["change_cipher_spec"] = 1] = "change_cipher_spec";
})(ChangeCipherSpecTypes || (ChangeCipherSpecTypes = {}));
(function (ChangeCipherSpecTypes) {
    ChangeCipherSpecTypes.__spec = TypeSpecs.define.Enum("uint8", ChangeCipherSpecTypes);
})(ChangeCipherSpecTypes || (ChangeCipherSpecTypes = {}));
var ChangeCipherSpec = /** @class */ (function (_super) {
    __extends(ChangeCipherSpec, _super);
    function ChangeCipherSpec(type) {
        var _this = _super.call(this, ChangeCipherSpec.__spec) || this;
        _this.type = type;
        return _this;
    }
    ChangeCipherSpec.createEmpty = function () {
        return new ChangeCipherSpec(ChangeCipherSpecTypes.change_cipher_spec);
    };
    ChangeCipherSpec.__spec = {
        type: TypeSpecs.define.Enum("uint8", ChangeCipherSpec),
    };
    return ChangeCipherSpec;
}(TLSStruct));
export { ChangeCipherSpec };
