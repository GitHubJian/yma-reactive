# YMA Reactive

将数据转变为响应式数据

## Install

```sh
npm install yma-reactive
```

## Usage

```js
const reactive = require('yma-reactive');

const state = reactive({
    data() {
        return {
            name: 'yma',
            sex: 'f',
            age: 10,
        };
    },
    watch: {
        // 可监听数据的变化
        name: {
            handler(newVal, oldVal) {
                // emit
            },
        },
    },
    computed: {
        // 将多个数据的变换归结于单一数据的变化
        customData: {
            get() {
                return {
                    name: this.name,
                    sex: this.sex,
                };
            },
            cache: true,
        },
    },
});

state.name = 'yma2';
```
