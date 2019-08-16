class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el)?el:document.querySelector(el);
        this.vm = vm;
        // 容错
        if(this.el) {
            // 反复获取dom会损耗性能，所以先把真实DOM放到内存中操作 fragment
            let fragment = this.node2fragment(this.el);
            // 从碎片中筛选出来元素结点（v-model）和文本节点（{{}}）
            this.compile(fragment);
            // 放回页面
            this.el.appendChild(fragment);
        }
    }

    // 判断el是个表示id的字符串还是一个获取到的dom元素
    isElementNode(node) {
        // 1表示是个html结点
        return node.nodeType === 1;
    }

    // 判断某个属性是不是指令
    isDirection(name) {
        return name.includes('v-');
    }



    // 把结点放入内存中
    node2fragment(el) {
        // 创建空间(文档碎片，存在于内存中的dom碎片)
        let fragment = document.createDocumentFragment();
        let firstChild;
        // 依次将el里的子元素放到文档碎片中
        while(firstChild = el.firstChild) {
            // append操作移动元素时会清除掉原元素
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

    compile(fragment) {
        let childNodes = fragment.childNodes;
        // 把类数组转换为一个数组
        Array.from(childNodes).forEach(node => {
            if(this.isElementNode(node)) {
                // 是元素结点 递归内部子节点
                this.compileElement(node);
                this.compile(node);
            } else {
                // 文本结点 {{}}
                this.compileText(node);
            }
        });
    }

    compileElement(node) {
        // v-model
        let attrs = node.attributes; // 获取结点的属性,是个类数组
        Array.from(attrs).forEach(attr=>{
            // attr是个键值对
            let attrName = attr.name
            if(this.isDirection(attrName)) {
                // 取到对应的值放到节点中
                let attrValue = attr.value;
                let type = attrName.slice(2);
                CompileUtil[type](node, this.vm, attrValue);
            }
        })
    }

    compileText(node) {
        let text = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if(reg.test(text)) {
            CompileUtil['text'](node, this.vm, text);
        }
    }
}

CompileUtil = {
    // 获取实例上对应的数据
    getVal(vm, expr) {
        expr = expr.split('.');
        return expr.reduce((prev, next)=>{
            return prev[next];
        }, vm.$data)
    },
    // 获取编译文本结点后的结果
    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        })
    },
    text(node, vm, text) {
        // 文本处理
        let updateFn = this.updater['textUpdater'];
        let value = this.getTextVal(vm, text);
        updateFn && updateFn(node, value);
    },
    model(node, vm, value) {
        // 输入框处理
        let updateFn = this.updater['modelUpdater'];
        updateFn && updateFn(node, this.getVal(vm, value)); 
    },
    updater: {
        // 文本更新
        textUpdater(node, value) {
            node.textContent = value;
        },
        // 输入框更新
        modelUpdater(node, value) {
            node.value = value;
        }
    }
}