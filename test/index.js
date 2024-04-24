const reactive = require('../src');

const react = reactive({
    data() {
        return {
            name: 'yma',
            sex: 'f',
        };
    },
    watch: {
        customData: {
            handler(newVal, oldVal) {
                console.log('newVal > ', newVal, ', oldVal > ', oldVal);
            },
        },
    },
    computed: {
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

react.name = 'xiaows';
