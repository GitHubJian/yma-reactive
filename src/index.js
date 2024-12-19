const {isPlainObject, noop, isReserved} = require('./util');
const {Watcher} = require('./watcher');
const {observe, set, del} = require('./observe');
const {Dep} = require('./dep');

let sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop,
};

function proxy(target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return this[sourceKey][key];
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
        this[sourceKey][key] = val;
    };

    Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initData(react, options) {
    let data = options.data;
    data = react._data = typeof data === 'function' ? data.call() : data || {};
    if (!isPlainObject(data)) {
        data = {};
    }

    let keys = Object.keys(data);
    let i = keys.length;
    while (i--) {
        let key = keys[i];
        if (!isReserved(key)) {
            proxy(react, '_data', key);
        }
    }

    observe(data);
}

const computedWatcherOptions = {lazy: true};
function initComputed(react, computed) {
    const watchers = (react._computedWatchers = Object.create(null));

    for (const key in computed) {
        const userDef = computed[key];
        const getter = typeof userDef === 'function' ? userDef : userDef.get;

        watchers[key] = new Watcher(react, getter || noop, noop, computedWatcherOptions);

        if (!(key in react)) {
            defineComputed(react, key, userDef);
        }
    }
}

function defineComputed(target, key, userDef) {
    if (typeof userDef === 'function') {
        sharedPropertyDefinition.get = createComputedGetter(key);
        sharedPropertyDefinition.set = noop;
    } else {
        sharedPropertyDefinition.get = userDef.get
            ? userDef.cache !== false
                ? createComputedGetter(key)
                : createGetterInvoker(userDef.get)
            : noop;
        sharedPropertyDefinition.set = userDef.set || noop;
    }

    if (sharedPropertyDefinition.set === noop) {
        sharedPropertyDefinition.set = function () {
            console.warn(`Computed property "${key}" was assigned to but it has no setter.`, this);
        };
    }

    Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
    return function computedGetter() {
        const watcher = this._computedWatchers && this._computedWatchers[key];
        if (watcher) {
            if (watcher.dirty) {
                watcher.evaluate();
            }

            if (Dep.target) {
                watcher.depend();
            }

            return watcher.value;
        }
    };
}

function createGetterInvoker(fn) {
    return function computedGetter() {
        return fn.call(this, this);
    };
}

function createWatcher(react, expOrFn, handler, options) {
    if (isPlainObject(handler)) {
        options = handler;
        handler = handler.handler;
    }

    return react.$watch(expOrFn, handler, options);
}

function initWatch(react, watch) {
    for (let key in watch) {
        let handler = watch[key];
        if (Array.isArray(handler)) {
            for (let i = 0; i < handler.length; i++) {
                createWatcher(react, key, handler[i]);
            }
        } else {
            createWatcher(react, key, handler);
        }
    }
}

function React(opts) {
    const react = this;

    react._watchers = [];

    if (opts.data) {
        initData(react, opts);
    } else {
        observe({});
    }

    if (opts.computed) {
        initComputed(react, opts.computed);
    }

    if (opts.watch) {
        initWatch(react, opts.watch);
    }

    return react;
}

React.prototype.$watch = function $watch(expOrFn, cb, options) {
    const react = this;
    options = options || {};

    if (isPlainObject(cb)) {
        return createWatcher(react, expOrFn, cb, options);
    }

    let watcher = new Watcher(react, expOrFn, cb, options);

    if (options.immediate) {
        try {
            cb.call(react, watcher.value);
        } catch (e) {
            console.error(`callback for immediate watcher "${watcher.expression}"`);
        }
    }

    return function unwatchFn() {
        watcher.teardown();
    };
};

React.prototype.$set = set;

React.prototype.$delete = del;

function reactive(opts) {
    return new React(opts);
}

function wrap(defaults, options) {
    for (const prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
            defaults[prop] = options[prop];
        }
    }

    return defaults;
}

module.exports = wrap(reactive, {
    React,
    $initData: initData,
    $initWatch: initWatch,
    $initComputed: initComputed,
});
