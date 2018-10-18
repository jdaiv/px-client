import Component from '../Component'
import { Vector3 } from '../Vector'

export default class Sprite3D extends Component {

    constructor (img, x, y, z) {
        super()
        this.img = img
        this.offset = new Vector3(x, y, z)
        this.frame = 0
    }

    draw (dt) {
        const p = this.parent.position
        this.parent.engine.v.drawImage(
            this.img,
            p.x + this.offset.x,
            p.y + this.offset.y,
            p.z + this.offset.z,
            this.frame
        )
    }

}