export function getPrimitiveSize(spec) {
    return +spec.size.substr("uint".length);
}
export var Vector;
(function (Vector) {
    function isVariableLength(spec) {
        return spec.maxLength !== spec.minLength;
    }
    Vector.isVariableLength = isVariableLength;
})(Vector || (Vector = {}));
export var Buffer;
(function (Buffer) {
    function isVariableLength(spec) {
        return spec.maxLength !== spec.minLength;
    }
    Buffer.isVariableLength = isVariableLength;
})(Buffer || (Buffer = {}));
// Shortcuts:
export var define = {
    Enum: function (size, enumType) { return ({ type: "enum", size: size, enumType: enumType }); },
    Number: function (size) { return ({ type: "number", size: size }); },
    Struct: function (structType) { return ({
        type: "struct",
        structType: structType,
    }); },
    Vector: function (itemSpec, minLength, maxLength, optional) {
        if (minLength === void 0) { minLength = 0; }
        if (maxLength === void 0) { maxLength = minLength; }
        if (optional === void 0) { optional = false; }
        return ({
            type: "vector",
            itemSpec: itemSpec,
            minLength: minLength, maxLength: maxLength,
            optional: optional,
        });
    },
    Buffer: function (minLength, maxLength) {
        if (minLength === void 0) { minLength = Number.POSITIVE_INFINITY; }
        if (maxLength === void 0) { maxLength = minLength; }
        return ({
            type: "buffer",
            minLength: minLength, maxLength: maxLength,
        });
    },
};
export var uint8 = Object.freeze(define.Number("uint8"));
export var uint16 = Object.freeze(define.Number("uint16"));
export var uint24 = Object.freeze(define.Number("uint24"));
export var uint32 = Object.freeze(define.Number("uint32"));
export var uint48 = Object.freeze(define.Number("uint48"));
export var uint64 = Object.freeze(define.Number("uint64"));
