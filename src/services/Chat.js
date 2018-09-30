import EventManager from './EventManager'
import Connector from './Connector'

class Room {

    constructor (id, name) {
        this.id = id
        this.name = name
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

export default class Chat {

    static init () {
        Chat.rooms = {}
        Chat.connected = false
        Chat.addRoom('system')
        Chat.addRoom('public')
        EventManager.subscribe('ws_message', 'chat_service', Chat.listen)
        EventManager.subscribe('ws_auth', 'chat_service', Chat.auth)
    }

    static addRoom (name) {
        if (!Chat.rooms[name]) {
            Chat.rooms[name] = new Room(name)
        }
        return Chat.rooms[name]
    }

    static joinRoom (name) {
        Connector.send('chat', name ? 'join_room' : 'create_room', name)
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
        if (data.error || data.scope != 'chat') return
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
            const room = Chat.addRoom(data.data.name)
            room.addEntry('system', 'connected')
            shouldUpdate = true
            break
        }
        if (shouldUpdate) EventManager.publish('chat_update', true)
    }

    static auth (status) {
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