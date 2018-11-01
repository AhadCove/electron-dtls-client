import * as TypeSpecs from "./TypeSpecs";
export var ContentType;
(function (ContentType) {
    ContentType[ContentType["change_cipher_spec"] = 20] = "change_cipher_spec";
    ContentType[ContentType["alert"] = 21] = "alert";
    ContentType[ContentType["handshake"] = 22] = "handshake";
    ContentType[ContentType["application_data"] = 23] = "application_data";
})(ContentType || (ContentType = {}));
(function (ContentType) {
    ContentType.__spec = TypeSpecs.define.Enum("uint8", ContentType);
})(ContentType || (ContentType = {}));
