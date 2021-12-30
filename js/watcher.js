class Watcher {
	constructor (vm, key, cb) {
		this.vm = vm 
		// data中的属性名称
		this.key = key
		// 回调函数负责更新视图
		this.cb = cb

		// watcher对象记录到Dep类的静态属性target
		Dep.target = this

		// 触发get方法, 在get方法会调用addSub
		this.oldValue = vm[key]
		Dep.target = null
	}
	// 数据变化时, 更新视图
	update () {
		let newValue = this.vm[this.key]
		if(this.oldValue === this.newValue) {
			return
		}
		this.cb(newValue)
	}
}
