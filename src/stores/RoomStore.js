import { observable, computed, action } from 'mobx'

class Room {

    @observable id
    @observable name
    @observable activity
    @observable.shallow log = []

    constructor (id, name, act) {
        this.id = id
        this.name = name
        this.activity = act
    }

    @action.bound
    addEntry (from, msg, notice) {
        const timestamp = new Date()
        let formatted
        if (from) {
            formatted = `(${timestamp.toLocaleTimeString()}) ${from}: ${msg}`
        } else {
            formatted = `(${timestamp.toLocaleTimeString()}) ${msg}`
        }
        this.log.push({
            from,
            msg,
            timestamp,
            formatted,
            notice: notice || !from
        })
    }

}

export default class RoomStore {
    @observable connected = false
    @observable active = null
    @observable list = []

    @computed get activeRoom () {
        return this.get(this.active)
    }

    // raw rooms

    @action.bound
    setActive (id) {
        if (!this.get(id)) {
            console.warn('tried to change to nonexisting room:', id)
            return
        }
        this.active = id
    }

    @action.bound
    add (id, name, act) {
        let room = this.get(id)
        if (!room) {
            room = new Room(id, name, act)
            this.list.push(room)
        }
        return room
    }

    get (id) {
        return this.list.find(r => r.id == id)
    }

    @action.bound
    delete (id) {
        const idx = this.list.find(r => r.id == id)
        if (idx >= 0) {
            this.list.splice(idx, 1)
        }
    }

    // chat actions

    @action.bound
    broadcast (from, msg, notice) {
        this.list.forEach(r => this.addEntry(r, from, msg, !!notice))
    }

    @action.bound
    addEntryById (id, from, msg, notice) {
        const room = this.get(id)
        if (!room) {
            return
        }

        room.addEntry(from, msg, notice)
    }

    @action.bound
    addEntry (room, from, msg, notice) {
        room.addEntry(from, msg, notice)
    }
}