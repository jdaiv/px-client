import EventManager from './EventManager'
import { Promise } from 'es6-promise'

export const DEFAULT_ROOMS = ['system', 'public']

export default class RoomService {

    constructor (roomStore, socket) {
        this.store = roomStore
        this.socket = socket
        DEFAULT_ROOMS.forEach(r => this.store.add(r, r, 0))
        EventManager.subscribe(
            'ws/chat/join_room',
            'chat_service',
            this.listenJoin)
        EventManager.subscribe(
            'ws/chat/new_message',
            'chat_service',
            this.listenMessage)
        EventManager.subscribe(
            'ws/chat/list_users',
            'chat_service',
            this.listenList)
        EventManager.subscribe(
            'ws_status',
            'chat_service',
            this.status)
        this.promises = {}
    }

    join (id) {
        const pKey = id
        if (!this.promises[pKey]) {
            const newP = {}
            this.socket.send('chat', 'join_room', id)
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

    create (name, activity) {
        const pKey = name
        if (!this.promises[pKey]) {
            const newP = {}
            this.socket.send('chat', 'create_room', '', { name, activity })
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

    getUserList (id) {
        const pKey = id + '/list'
        if (!this.promises[pKey]) {
            const newP = {}
            this.socket.send('chat', 'list_users', id)
            newP.p = new Promise((resolve, reject) => {
                newP.resolve = resolve
                newP.reject = reject
            })
            this.promises[pKey] = newP
        }
        return this.promises[pKey].p
    }

    send (room, msg) {
        this.socket.send('chat', 'message', room, {
            content: msg
        })
    }

    listenJoin = ({ error, action, data }) => {
        let roomName = action.target
        if (error == 2002) {
            if (this.store.active == roomName) this.store.setActive('public')
            this.store.delete(roomName)
            if (this.promises[roomName]) {
                this.promises[roomName].reject()
                delete this.promises[roomName]
            }
        } else if (!error) {
            const room = this.store.add(data.name, data.friendly_name, data.activity)
            this.store.addEntry(room, {
                from: '',
                content: 'connected',
            })
            EventManager.publish('chat_join', data.name)
            if (this.promises[roomName]) {
                this.promises[roomName].resolve()
                delete this.promises[roomName]
            }
        }
    }

    listenMessage = ({ error, action, data }) => {
        let room = this.store.get(action.target)
        if (room) {
            this.store.addEntry(room, data)
        } else {
            console.warn(`received message for ${action.target}, but we're not subscribed to it`)
        }
    }

    listenList = ({ error, action, data }) => {
        const pKey = action.target + '/list'
        if (this.promises[pKey]) {
            if (error != 0) {
                this.promises[pKey].reject()
            } else {
                this.promises[pKey].resolve(data)
            }
            delete this.promises[pKey]
        }
    }

    status = (status) => {
        // ignore if nothing's changed
        if (this.store.connected == status) return

        this.store.connected = status
        this.store.list.forEach(({ id }) => {
            if (status) {
                if (DEFAULT_ROOMS.includes(id)) {
                    this.store.addEntryById(id, {
                        from: '',
                        content: 'connected',
                    })
                } else {
                    this.join(id)
                }
            } else {
                this.store.addEntryById(id, {
                    from: '',
                    content: 'disconnected',
                })
            }
        })
    }

}