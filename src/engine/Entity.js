import { vec3 } from 'gl-matrix'

export default class Entity {

    constructor (name) {
        this.components = []
        this.name = name

        this.position = vec3.create()
        this.active = true
        this.destroyed = false

        this.networked = false
        this.isAuthority = false
        this.networkId = ''
        this.networkDirty = false
    }

    addComponent (c) {
        c.init(this, this.engine)
        this.components.push(c)
        return c
    }

    removeComponent (c) {
        c.remove()
        this.components.splice(this.components.indexOf(c), 1)
    }

    tick (dt) {
        if (!this.active) return
        this.components.forEach(c => {
            if (typeof c.tick === 'function') c.tick(dt)
        })
    }

    draw (dt) {
        if (!this.active) return
        this.components.forEach(c => {
            if (typeof c.draw === 'function') c.draw(dt)
        })
    }

    destroy () {
        this.active = false
        this.destroyed = true
        this.components.forEach(c => c.remove())
    }

    networkRecv () {

    }

    networkSend () {
        this.networkDirty = false
    }


}