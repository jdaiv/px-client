import EventManager from './EventManager'
import { Promise } from 'es6-promise'
import { action } from 'mobx'

export const DEFAULT_ROOMS = ['system', 'public']

export default class RoomService {

    constructor (roomStore, socket) {
        this.store = roomStore
        this.socket = socket
        // DEFAULT_ROOMS.forEach(r => this.store.add(r, r, 0))

        EventManager.subscribe(
            'ws/chat/join_room',
            'chat_service',
            this.listenJoin)
        EventManager.subscribe(
            'ws/chat/update_room',
            'chat_service',
            this.listenUpdate)
        EventManager.subscribe(
            'ws/chat/new_message',
            'chat_service',
            this.listenMessage)
        EventManager.subscribe(
            'ws/chat/list_users',
            'chat_service',
            this.listenList)
        EventManager.subscribe(
            'ws/activity/list',
            'chat_service',
            this.listenListAct)
        EventManager.subscribe(
            'ws_status',
            'chat_service',
            this.status)
        this.promises = {}

        this.join('station')

        this.socket.send('activity', 'list', '')
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

    create (name) {
        const pKey = 'create'
        if (!this.promises[pKey]) {
            const newP = {}
            this.socket.send('chat', 'create_room', '', { name })
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

    update (id, data) {
        this.socket.send('chat', 'update_room', id, data)
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
                this.promises[roomName].reject(roomName)
                delete this.promises[roomName]
            } else if (this.promises.create) {
                this.promises.create.reject(roomName)
                delete this.promises.create
            }
        } else if (!error) {
            const room = this.store.add(data.name, data.friendly_name)
            this.store.setActive(roomName)
            this.updateRoom(room, data)
            this.store.addEntry(room, {
                from: '',
                content: 'connected',
            })
            EventManager.publish('chat_join', roomName)
            if (this.promises[roomName]) {
                this.promises[roomName].resolve(roomName)
                delete this.promises[roomName]
            } else if (this.promises.create) {
                this.promises.create.resolve(roomName)
                delete this.promises.create
            }
        }
    }

    listenUpdate = ({ error, action, data }) => {
        if (error) return
        let room = this.store.get(action.target)
        if (room) {
            this.updateRoom(room, data)
        } else {
            console.warn(`received update for ${action.target}, but we're not subscribed to it`)
        }
    }

    @action
    updateRoom (room, data) {
        [
            ['owner', 'owner',],
            ['name', 'friendly_name'],
            ['activity', 'activity'],
            ['activityState', 'activity_state'],
        ].forEach(m => { room[m[0]] = data[m[1]] })
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

    listenListAct = ({ error, data }) => {
        if (!error) {
            let arr = []
            for (let id in data) {
                arr.push({ id, title: data[id] })
            }
            this.store.activityTypes.replace(arr)
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