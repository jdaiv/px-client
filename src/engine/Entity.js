import { vec3 } from 'gl-matrix'

export default class Entity {

    constructor (name) {
        this.components = []
        this.name = name

        this.position = vec3.create()
        this.active = true
        this.destroyed = false
    }

    addComponent (c) {
        c.parent = this
        this.components.push(c)
        return c
    }

    removeComponent (c) {
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
    }


}