const {pushTarget, popTarget} = require('./dep');
const {queueWatcher} = require('./scheduler');
const {parsePath, noop, isObject} = require('./util');
const traverse = require('./traverse');

let uid = 0;
class Watcher {
    constructor(react, expOrFn, cb, options) {
        this.react = react;
        react._watchers.push(this);

        if (options) {
            this.deep = !!options.deep;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
            this.before = options.before;
        } else {
            this.deep = this.lazy = this.sync = false;
        }
        this.cb = cb;
        this.id = ++uid;
        this.active = true;
        this.dirty = this.lazy;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();

        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if (!this.getter) {
                this.getter = noop;
            }
        }

        this.value = this.lazy ? undefined : this.get();
    }

    get() {
        pushTarget(this);
        let value;
        const react = this.react;
        try {
            value = this.getter.call(react, react);
        } catch (e) {
            throw e;
        } finally {
            if (this.deep) {
                traverse(value);
            }
            popTarget();
            this.cleanupDeps();
        }

        return value;
    }

    addDep(dep) {
        const id = dep.id;

        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }

    cleanupDeps() {
        let i = this.deps.length;
        while (i--) {
            const dep = this.deps[i];
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        }

        let tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    }

    update() {
        if (this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    }

    run() {
        if (this.active) {
            const value = this.get();
            if (value !== this.value || isObject(value) || this.deep) {
                const oldValue = this.value;
                this.value = value;

                this.cb.call(this.react, value, oldValue);
            }
        }
    }

    evaluate() {
        this.value = this.get();
        this.dirty = false;
    }

    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend();
        }
    }

    teardown() {
        if (this.active) {
            let i = this.deps.length;
            while (i--) {
                this.deps[i].removeSub(this);
            }
            this.active = false;
        }
    }
}

exports.Watcher = Watcher;
