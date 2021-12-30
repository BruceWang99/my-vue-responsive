class Vue {
	constructor(options) {
		// 1. 属性
		this.$options = options || options
		this.$data = options.data || {}
		this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
		// vue实例上的属性代理到data对象
		this._proxyData(this.$data)
		// 调用observer对象, 监听数据变化
		new Observer(this.$data) // 把$data的所有属性响应式 
		// 调用Compiler对象, 解析dom
		new Compiler(this)
	}
	_proxyData (data) {
		Object.keys(data).forEach(key=>{
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true, // 可删除,可get set这些
				get() {
					console.log('get', data[key]);
					return data[key]
				},
				set(val) {
					if(val === data[key]) return
					data[key] = val
				}
			})
		})
	}
}