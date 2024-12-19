const hasProto = '__proto__' in {};
exports.hasProto = hasProto;

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}
exports.isObject = isObject;

const _toString = Object.prototype.toString;

function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]';
}
exports.isPlainObject = isPlainObject;

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}
exports.def = def;

function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}
exports.remove = remove;

function isValidArrayIndex(val) {
    const n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val);
}
exports.isValidArrayIndex = isValidArrayIndex;

const unicodeRegExp =
    /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
const bailRE = new RegExp('[^' + unicodeRegExp.source + '.$_\\d]');
function parsePath(path) {
    if (bailRE.test(path)) {
        return;
    }

    let segments = path.split('.');
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) {
                return;
            }
            obj = obj[segments[i]];
        }
        return obj;
    };
}
exports.parsePath = parsePath;

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}
exports.hasOwn = hasOwn;

function isNative(Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}
exports.isNative = isNative;

function noop() {}
exports.noop = noop;

function isReserved(str) {
    let c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5f;
}
exports.isReserved = isReserved;
