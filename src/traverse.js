/* @flow */
const {isObject} = require('./util');

const seenObjects = new Set();

function _traverse(val, seen) {
    let i;
    let keys;
    const isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
        return;
    }

    if (val.__ob__) {
        const depId = val.__ob__.dep.id;
        if (seen.has(depId)) {
            return;
        }
        seen.add(depId);
    }

    if (isA) {
        i = val.length;
        while (i--) {
            _traverse(val[i], seen);
        }
    } else {
        keys = Object.keys(val);
        i = keys.length;
        while (i--) {
            _traverse(val[keys[i]], seen);
        }
    }
}

function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}
module.exports = traverse;
