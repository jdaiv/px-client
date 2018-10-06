import EventManager from './EventManager'
import { Promise } from 'es6-promise';

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
            'ws_status',
            'chat_service',
            this.status)
        this.promises = {}
    }

    join (name) {
        if (this.promises[name]) return this.promises[name]
        this.socket.send('chat', 'join_room', name)
        return new Promise((resolve, reject) => {
            this.promises[name] = { resolve, reject }
        })
    }

    create (name, activity) {
        if (this.promises[name]) return this.promises[name]
        this.socket.send('chat', 'create_room', '', {
            name,
            activity
        })
        return new Promise((resolve, reject) => {
            this.promises[name] = { resolve, reject }
        })
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