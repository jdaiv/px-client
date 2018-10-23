import { vec3 } from 'gl-matrix'

import Component from '../Component'

export default class Collider extends Component {

    constructor (x, y, z, w, h, d) {
        super()
        this.offset = vec3.set(vec3.create(), x, y, z)
        this.extents = vec3.set(vec3.create(), w, h, d)
    }

    init (parent, engine) {
        super.init(parent, engine)

        engine.phys.addCollider(this)
    }

    remove () {
        super.remove()
        this.engine.phys.removeCollider(this)
    }

}