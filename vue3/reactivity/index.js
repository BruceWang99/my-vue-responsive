const isobject = val => val !== null && typeof val === 'object'
const convert = target => isobject(target) ? reactive(target) : target // 是对象,递归
const hasOwnProperty = Object.prototype.hasOwnProperty
const hasOwn = (target, key) => hasOwnProperty.call(target, key)
// 对象转化为响应式对象
export function reactive(target) {
	if(!isobject(target)) return  target
	const handler = {
		get (target, key, receiver) {
			// 收集依赖
			console.log('get', key)
			track (target, key)
			const result = Reflect.get(target, key, receiver)
			return convert(result)
		},
		set (target, key, value, receiver) {  
			const oldValue = Reflect.get(target, key, receiver)
			let result = true
			if(oldValue !== value) {
				result = Reflect.set(target, key, value, receiver)
				// 触发更新
				console.log('set', key, value);
				trigger(target, key)
			}
			return result
		},
		deleteProperty (target, key) {
			const hasKey = hasOwn(target, key)
			const result = Reflect.deleteProperty(target, key)
			if(hasKey && result) {
				// 触发更新
				console.log('delete', key);
				trigger(target, key)
			}
			return result
		}
	}
	return new Proxy(target, handler)
}

// 副作用方法, 注册时执行一次, 响应式数据变化时, 执行一次
let activeEffect = null
export function effect (callback) {
	activeEffect = callback
	callback() // 访问响应式对象属性, 去收集依赖
	activeEffect = null
}


// 收集依赖
let targetMap = new WeakMap()
export function track (target, key) {
	if (!activeEffect) return
	let depsMap = targetMap.get(target)
	if(!depsMap) {
		targetMap.set(target, (depsMap = new Map()))
	}
	let dep = depsMap.get(key)
	if (!dep) {
		depsMap.set(key, (dep = new Set()))
	}
	dep.add(activeEffect)
}

// 触发更新
export function trigger (target, key) {
	const depsMap = targetMap.get(target)
	if(!depsMap) return
	const dep = depsMap.get(key)
	if(dep) {
		dep.forEach(effect => {
			effect()
		});
	}
}

// 把基本类型和引用类型都转化为响应式数据, 注册时执行一次
export function ref (raw) {
	// 判断row是否是ref创建的对象, 如果是, 返回
	if(isobject(raw) && raw.__v_isRef) return

	let value = convert(raw)
	const r = {
		__v_isRef: true,
		get value() {
			track(r, 'value')
			return value
		},
		set value (newvalue) {
		  if(newvalue !== value) {
			  raw = newvalue
			  value = convert(raw)
			  trigger(r, 'value')
		  }
		}
	}
	return r

}

// 把proxy实例的响应式对象, ref化, 使它解构或属性为对象时,重新赋值不丢失响应特性
export function toRefs (proxy) {
	const ret = proxy instanceof Array ? new Array(proxy.length) : {}

	for(const key in proxy) {
		ret[key] = toProxyRef(proxy, key)
	}
	return ret
}
// 计算方法, 返回一个依于getter函数的响应式数据的计算值, 是响应式的
export function computed (getter) {
	const result = ref()
	effect(()=>result.value = getter())
	return Reflect.get(result, 'value', result)
}

// proxy属性ref化
function toProxyRef (proxy, key) {
	const r = {
		__v_isRef: true,
		get value () {
			return proxy[key]
		},
		set value (newvalue) {
			proxy[key] = newvalue
		}
	}
	return r
}