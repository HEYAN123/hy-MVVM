class MVVM {
    // es6语法接收参数
    constructor(options) {
        // 把数据挂在this上，保证方法都能以this.xxx取到数据
        // $xxx：私有
        this.$el = options.el;
        this.$data = options.data;

        if(this.$el) {
            // 数据劫持（监控数据的变化）:把所有属性的使用都通过get和set
            new Observer(this.$data);
            // this.$data.message => this.message   (属性代理)
            this.proxyData(this.$data);
            // 编译类
            new Compile(this.$el, this);
        }
    }

    proxyData(data) {
        Object.keys(data).forEach(key=> {
            Object.defineProperty(this, key, {
                get() {
                    return data[key];
                },
                set(newValue) {
                    data[key] = newValue;
                }
            })
        })
    }
}