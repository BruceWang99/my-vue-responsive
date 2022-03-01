// 数据劫持

class Observer {
	constructor(data) {
		this.walk(data)
	}
	walk (data) {
		if(!data || typeof data !== 'object'){ // 这句精华
			return
		}
		Object.keys(data).forEach((key)=>{
			this.defineReactive(data, key, data[key])
		})
	}
	// 对象属性 onfigurable化
	defineReactive (obj, key, val) {
		this.walk(val) // val是对象, 也转化为响应式
		let self = this
		// 给每一个属性都设置一个发布者
		let dep = new Dep()
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: true,
			get() {
			    Dep.target && dep.addSub(Dep.target) // 这里是在发布者实例中, 添加观察者, 以便后面接到通知 ps: 这里之所以能触发, 是因为new Watcher的时候, 调用了vm[key], 从而触发了vm.$data的get方法, 前面之所以加是否有Dep.target的判断, 是为了区分是普通的get还是 new Watcher里的get 
				return val // 这里不用data[key]是因为会发生死循环调用, 和vue实例的代理数据产生的, 所以这里使用闭包解决
			},
			set(newVal) {
				if(newVal === val) return
				val = newVal

				self.walk(newVal)// set 之后的值响应式
				// 发送通知给观察者
				dep.notify()
			}
		})
	}
}