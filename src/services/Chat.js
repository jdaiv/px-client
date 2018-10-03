import EventManager from './EventManager'
import Connector from './Connector'

class Room {

    constructor (id, name, act) {
        this.id = id
        this.name = name
        this.activity = act
        this.log = []
    }

    addEntry (from, content) {
        this.log.push({
            from,
            content,
            timestamp: new Date()
        })
    }

}

const DEFAULT_ROOMS = ['system', 'public']

export default class Chat {

    static init () {
        Chat.rooms = {}
        Chat.connected = false
        Chat.activeRoom = ''
        DEFAULT_ROOMS.forEach(r => Chat.joinRoom(r))
        EventManager.subscribe('ws_message', 'chat_service', Chat.listen)
        EventManager.subscribe('ws_status', 'chat_service', Chat.status)
    }

    static setActiveRoom (id) {
        if (!Chat.rooms[id]) {
            console.warn('tried to change to nonexisting room:', id)
            return
        }
        Chat.activeRoom = id
        EventManager.publish('chat_change_room', Chat.rooms[id])
    }

    static addRoom (id, name, act) {
        if (!Chat.rooms[id]) {
            Chat.rooms[id] = new Room(id, name, act)
        }
        return Chat.rooms[id]
    }

    static joinRoom (name) {
        Connector.send('chat', 'join_room', name)
    }

    static createRoom (name, activity) {
        Connector.send('chat', 'create_room', {
            name,
            activity
        })
    }

    static broadcast (from, msg) {
        for (let key in Chat.rooms) {
            Chat.rooms[key].addEntry(from, msg)
        }
    }

    static send (room, msg) {
        Connector.send('chat', 'message', {
            room,
            content: msg
        })
    }

    static listen (data) {
        if (data.scope != 'chat') return
        let shouldUpdate = false
        switch (data.action) {
        case 'new_message':
            let roomName = data.data.room
            if (Chat.rooms[roomName]) {
                Chat.rooms[roomName].addEntry(data.data.from, data.data.content)
                shouldUpdate = true
            } else {
                console.warn(`received message for ${roomName}, but we're not subscribed to it`)
            }
            break
        case 'join_room':
            if (data.error == 2002) {
                if (Chat.activeRoom) Chat.setActiveRoom('public')
                delete Chat.rooms[data.data]
            } else {
                const room = Chat.addRoom(data.data.name, data.data.friendly_name, data.data.activity)
                room.addEntry('system', 'connected')
                EventManager.publish('chat_join', data.data.name)
            }
            shouldUpdate = true
            break
        }
        if (shouldUpdate) EventManager.publish('chat_update', true)
    }

    static status (status) {
        // ignore if nothing's changed
        if (Chat.connected == status) return

        Chat.connected = status
        for (let key in Chat.rooms) {
            if (status) {
                Chat.joinRoom(key)
            } else {
                Chat.rooms[key].addEntry('system', 'disconnected')
            }
        }
        EventManager.publish('chat_update', true)
    }

}