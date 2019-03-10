type EventFunc = (arg0: any) => void

export default class EventManager {

    private static subscribers = new Map<string, Map<string, EventFunc>>()

    public static init() {
        this.clear()
    }

    public static clear() {
        this.subscribers.clear()
    }

    public static subscribe(type: string, id: string, func: EventFunc) {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Map<string, EventFunc>())
        }
        const group = this.subscribers.get(type)
        if (group.has(id)) {
            console.warn(id, 'already subscibed to', type)
            return
        }
        group.set(id, func)
    }

    public static unsubscribe(type: string, id: string) {
        if (!this.subscribers.has(type)) {
            this.subscribers.get(type).delete(id)
        }
    }

    public static publish(type: string, data: any) {
        if (!this.subscribers.has(type)) {
            // console.warn('no subscribers for (', type, '), payload ignored', data)
            return
        }
        this.subscribers.get(type).forEach(fn => fn(data))
    }

}
