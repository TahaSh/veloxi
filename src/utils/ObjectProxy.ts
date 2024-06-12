export function createProxy(target: any, callback: () => void): any {
  const handler: ProxyHandler<any> = {
    set: (obj, prop, value) => {
      if (typeof obj[prop] === 'object' && obj[prop] !== null) {
        obj[prop] = createProxy(value, callback)
      } else {
        callback()
        obj[prop] = value
      }
      return true
    },
    get: (obj, prop) => {
      if (typeof obj[prop] === 'object' && obj[prop] !== null) {
        return createProxy(obj[prop], callback)
      }
      return obj[prop]
    }
  }

  return new Proxy(target, handler)
}
