// 操作dom
class Compiler {
	constructor(vm) {
		this.el = vm.$el
		this.vm = vm
		this.compile(this.el)
	}
	// 编译模版, 处理文本节点和元素节点
	compile(el) {
		let childNodes = el.childNodes
		// 遍历el所有子节点
		Array.from(childNodes).forEach(node => {
			if(this.isTextNode(node)){
				this.compileText(node)
			} else if(this.isElementNode(node)){
				this.compileElement(node)
			}
			// node节点是否有子节点, 有的话, 递归
			if(node.childNodes && node.childNodes.length > 0) {
				this.compile(node)
			}
		});
		
	}
	// 编译元素节点, 处理指令 v-x
	compileElement(node) {
		// 模拟两个 v-text v-moel
		console.log(node.attributes);
		// textContent name
		//遍历属性节点
		Array.from(node.attributes).forEach(attri=>{
			let attrName = attri.name
			if(this.isDirective(attrName)){
				attrName = attrName.substr(2)
				let key = attri.value
				console.log('attrName', attrName);
				if(/^(\w+):([a-zA-Z0-9]+)$/.test(attrName)) {
					let eventName = RegExp.$1
					let eventType = RegExp.$2.trim()
					this.onUpdater(node, eventType, eventName, key)
				} else {
					this.update(node, key, attrName)
				}
			}
		})
	}
	update(node, key, attrName) {
		let updateFn = this[`${attrName}Updater`]
		updateFn && updateFn.call(this, node, this.vm[key], key)
	}
	// 处理v-text指令
	textUpdater (node, value, key) {
		node.textContent = value
		// 创建watcher, 改变视图
		new Watcher(this.vm, key, (newValue) => {
			node.textContent = newValue
		})
	}
	// 处理v-html指令
	htmlUpdater (node, value, key) {
		node.innerHTML = value
		// 创建watcher, 改变视图
		new Watcher(this.vm, key, (newValue) => {
			node.innerHTML = newValue
		})
	}
	// 处理v-model指令
	modelUpdater (node, value, key) {
		console.log(node);
		console.log(value);
		node.value = value
		new Watcher(this.vm, key, (newValue) => {
			node.value = newValue
		})
		// 双向绑定
		node.addEventListener('input', () => {
			this.vm[key] = node.value
		})
	}
	// 处理v-on指令
	onUpdater (node, eventType, eventName, attrValue) {
		console.log(node);
		console.log(eventType);
		console.log(eventName);
		// 例如 v-on:click="test()"
        // 1. 把对应的事件绑定到node上
		// 2. 把对应的事件的回调函数做下监听
		// 3. 处理下自定义函数的参数

		// 回调事件
		node.addEventListener(eventType, (e) => {
			let args = []
			let key = ''
			if(/^([a-zA-Z0-9]+)\((.*)\)$/.test(attrValue)){
				key = RegExp.$1
				args = RegExp.$2.split(',').map(item=>item.trim().replace(/'|"/g, ''))
			}
			this.vm.$options.methods && this.vm.$options.methods[key].apply(this.vm, args.length ? args : e)
		})
	}
	// 编译文本节点, 处理差值表达式 {{}}
	compileText(node) {
		// console.dir(node, '<=====textnode');
		// {{ msg }}
		let reg = /\{\{(.+?)\}\}/g
		let value = node.textContent
		if(reg.test(value)) {
			let key = RegExp.$1.trim() // key值去空格
			node.textContent = value.replace(reg, this.vm[key])

			// 创建watcher, 改变视图
			new Watcher(this.vm, key, (newValue) => {
				node.textContent = newValue
			})
		}

	}
	// 判断元素属性是否是指令
	isDirective (attrName) {
		return attrName.startsWith('v-')
	}
	// 判断节点是否是文本节点
	isTextNode(node) {
		return node.nodeType === 3
	}
	// 判断节点是否是元素节点
	isElementNode(node) {
		return node.nodeType === 1
	}
}