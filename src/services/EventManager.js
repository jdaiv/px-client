export default class EventManager {

    static init () {
        EventManager.subscribers = {}
    }

    static subscribe (type, id, func) {
        if (EventManager.subscribers[type] == null) {
            EventManager.subscribers[type] = {}
        }
        if (EventManager.subscribers[type][id]) {
            console.warn(id, 'already subscibed to', type)
            return
        }
        EventManager.subscribers[type][id] = func
    }

    static unsubscribe (type, id) {
        if (EventManager.subscribers[type] != null) {
            delete EventManager.subscribers[type][id]
        }
    }

    static publish (type, data) {
        const group = EventManager.subscribers[type]
        if (group == null) {
            console.warn('no subscribers for (', type, '), payload ignored', data)
            return
        }
        for (let key in group) {
            if (group[key]) group[key](data)
        }
    }

}