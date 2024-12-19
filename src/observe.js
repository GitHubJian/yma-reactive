const {Dep} = require('./dep');
const {arrayMethods} = require('./array');
const {def, hasProto, isPlainObject, isObject, hasOwn, isValidArrayIndex} = require('./util');

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

let shouldObserve = true;
function toggleObserving(value) {
    shouldObserve = value;
}
exports.toggleObserving = toggleObserving;

class Observer {
    constructor(value) {
        this.value = value;
        this.dep = new Dep();

        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            if (hasProto) {
                protoAugment(value, arrayMethods);
            } else {
                copyAugment(value, arrayMethods, arrayKeys);
            }

            this.observeArray(value);
        } else {
            this.walk(value);
        }
    }

    walk(obj) {
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i]);
        }
    }

    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    }
}
exports.Observer = Observer;

function protoAugment(target, src) {
    target.__proto__ = src;
}

function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}

function observe(value) {
    if (!isObject(value)) {
        return;
    }

    let ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if (shouldObserve && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value)) {
        ob = new Observer(value);
    }

    return ob;
}
exports.observe = observe;

function defineReactive(obj, key, val) {
    const dep = new Dep();

    const property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return;
    }

    const getter = property && property.get;
    const setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key];
    }

    let childOb = observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val;
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }

            return value;
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val;
            if (newVal === value || (newVal !== newVal && value !== value)) {
                return;
            }

            if (getter && !setter) {
                return;
            }

            if (setter) {
                setter.call(obj, newVal);
            } else {
                val = newVal;
            }

            childOb = observe(newVal);

            dep.notify();
        },
    });
}
exports.defineReactive = defineReactive;

function set(target, key, val) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1, val);
        return val;
    }

    if (key in target && !(key in Object.prototype)) {
        target[key] = val;
        return val;
    }

    const ob = target.__ob__;
    if (!ob) {
        target[key] = val;
        return val;
    }

    defineReactive(ob.value, key, val);
    ob.dep.notify();

    return val;
}
exports.set = set;

function del(target, key) {
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
        return;
    }

    const ob = target.__ob__;
    if (!hasOwn(target, key)) {
        return;
    }

    delete target[key];
    if (!ob) {
        return;
    }

    ob.dep.notify();
}
exports.del = del;

function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__ob__ && e.__ob__.dep.depend();
        if (Array.isArray(e)) {
            dependArray(e);
        }
    }
}
