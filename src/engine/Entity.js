import { vec3 } from 'gl-matrix'

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

    constructor (name) {
        this.name = name

        this.active = true
        this.destroyed = false

        this.transform = new Transform()
    }

    tick (dt) {
        if (!this.active) return
    }

    draw (dt) {
        if (!this.active) return
    }

    destroy () {
        this.active = false
        this.destroyed = true
    }

}