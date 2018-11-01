import * as TypeSpecs from "../TLS/TypeSpecs";
export var Cookie;
(function (Cookie) {
    Cookie.spec = TypeSpecs.define.Buffer(0, Math.pow(2, 8) - 1);
})(Cookie || (Cookie = {}));
