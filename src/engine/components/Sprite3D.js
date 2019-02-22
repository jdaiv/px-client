import { vec3 } from 'gl-matrix'

import Component from '../Component'

export default class Sprite3D extends Component {

    constructor (img, x = 0, y = 0, z = 0) {
        super()
        this.img = img
        this.offset = vec3.set(vec3.create(), x, y, z)
        this.frame = 0
    }

    draw (dt) {
        const position = vec3.add(vec3.create(), this.offset, this.parent.transform.worldPosition)
        this.engine.v.drawSprite(this.img, { position, scale: 's' }, 'textured', this.frame)
    }

    remove () {
        super.remove()
    }

}