class Observer {
    constructor(data) {
        this.observe(data);
    }

    observe(data) {
        // 修改data属性 get set
        if(!data || typeof data !== 'object') {
            return;
        }
        // 劫持
        // 把对象里的属性名摘出来组成了数组
        Object.keys(data).forEach((key) => {
            // 定义响应式
            this.defineReacive(data, key, data[key]);
            this.observe(data[key]);
        });
    }

    // 数据劫持的方法
    defineReacive(obj, key, value) {
        let that = this;
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            get() {
                Dep.target && dep.addSub(Dep.target);
                return value;
            }, 
            set(newValue) {
                if(newValue != value) {
                    that.observe(newValue);
                    value = newValue;
                    dep.notify();
                }
            }
        })
    }
}

class Dep {
    constructor() {
        // 订阅的数组
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() {
        this.subs.forEach(watcher=> {
            watcher.update()
        })
    }
}