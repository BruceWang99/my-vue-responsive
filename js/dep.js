// 观察者模式中的发布者
class Dep {
	constructor() {
		// 存储观察者
		this.subs = []
	}
	// 添加观察者
	addSub(sub) {
		if(sub && sub.update) {
			this.subs.push(sub)
		}
	}
	// 发送通知
	notify() {
		this.subs.forEach(sub => {
			sub.update()
		})
	}
}