import { vec3 } from 'gl-matrix'
import Engine from './Engine'

export class Transform {
    // tslint:disable-next-line: variable-name
    private _position = vec3.create()

    // ugh, I don't want this for now at least
    // _scale = vec3.create()

    public parent?: Transform

    get position() {
        return this._position
    }

    set position(v) {
        this._position = v
    }

    get worldPosition() {
        return vec3.add(vec3.create(), this._position, this.findOffset())
    }

    set worldPosition(v) {
        this._position = vec3.add(vec3.create(), v, this.findOffset())
    }

    public findOffset() {
        let p = this.parent
        const offset = vec3.create()
        while (p != null) {
            vec3.add(offset, offset, p._position)
            p = p.parent
        }
        return offset
    }
}

export default class Entity {

    public name: string
    public active: boolean
    public destroyed: boolean
    public transform: Transform
    public engine: Engine

    constructor(name: string) {
        this.name = name
        this.active = true
        this.destroyed = false
        this.transform = new Transform()
    }

    public init(engine: Engine) {
        this.engine = engine
    }

    public tick(dt: number) {
        if (!this.active) return
    }

    public draw(dt: number) {
        if (!this.active) return
    }

    public destroy() {
        this.active = false
        this.destroyed = true
    }

}
