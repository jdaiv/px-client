import { vec3 } from 'gl-matrix'

export class NetworkInfo {

    get isAuthority () {
        return false
    }

    constructor (enabled, id, owner) {
        this.enabled = enabled
        this.id = id
        this.owner = owner
    }

}

export class PhysicsInfo {

    constructor (enabled, collider, weight = 0) {
        this.enabled = enabled
        this.collider = collider
        this.weight = weight
    }

}

export class Transform {
    _position = vec3.create()

    // ugh, I don't want this for now at least
    // _scale = vec3.create()

    parent = null

    get position () {
        return this._position
    }

    set position (v) {
        this._position = v
    }

    get worldPosition () {
        return vec3.add(vec3.create(), this._position, this.findOffset())
    }

    set worldPosition (v) {
        this._position = vec3.add(vec3.create(), v, this.findOffset())
    }

    findOffset () {
        let p = this.parent
        let offset = vec3.create()
        while (p != null) {
            vec3.add(offset, offset, p._position)
            p = p.parent
        }
        return offset
    }
}

export default class Entity {

    constructor (engine, name, netInfo) {
        this.engine = engine
        this.components = new Map()
        this.componentsInfo = new Map()
        this.name = name

        this.active = true
        this.destroyed = false

        this.transform = new Transform()

        this.physInfo = new PhysicsInfo()
        this.netInfo = netInfo
        this.renderInfo = null
    }

    addComponent (name, c) {
        c.init(this, this.engine)
        this.components.set(name, c)
        this.componentsInfo.set(name, {
            c,
            canTick: typeof c.tick === 'function',
            canDraw: typeof c.draw === 'function'
        })
        return c
    }

    removeComponent (name) {
        this.components[name].remove()
        this.components.delete(name)
        this.componentsInfo.delete(name)
    }

    tick (dt) {
        if (!this.active) return
        this.componentsInfo.forEach(cI => {
            if (cI.canTick) cI.c.tick(dt)
        })
    }

    draw (dt) {
        if (!this.active) return
        this.componentsInfo.forEach(cI => {
            if (cI.canDraw) cI.c.draw(dt)
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