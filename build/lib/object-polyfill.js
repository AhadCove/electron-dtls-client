export function entries(obj) {
    return Object.keys(obj)
        .map(function (key) { return [key, obj[key]]; });
}
export function values(obj) {
    return Object.keys(obj)
        .map(function (key) { return obj[key]; });
}
export function filter(obj, predicate) {
    var ret = {};
    for (var _i = 0, _a = entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (predicate(val))
            ret[key] = val;
    }
    return ret;
}
/**
 * Kopiert Eigenschaften rekursiv von einem Objekt auf ein anderes
 * @param target - Das Zielobjekt, auf das die Eigenschaften übertragen werden sollen
 * @param source - Das Quellobjekt, aus dem die Eigenschaften kopiert werden sollen
 */
export function extend(target, source) {
    target = target || {};
    for (var _i = 0, _a = entries(source); _i < _a.length; _i++) {
        var _b = _a[_i], prop = _b[0], val = _b[1];
        if (val instanceof Object) {
            target[prop] = extend(target[prop], val);
        }
        else {
            target[prop] = val;
        }
    }
    return target;
}
