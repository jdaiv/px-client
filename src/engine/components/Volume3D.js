import Component from '../Component'
import { Vector3 } from '../Vector'

export default class Volume3D extends Component {

    constructor (volume, x, y, z) {
        super()
        this.volume = volume
        this.offset = new Vector3(x, y, z)
        this.frame = 0
    }

    draw (dt) {
        const p = this.parent.position
        this.parent.engine.v.drawVolume(
            this.volume,
            p.x + this.offset.x,
            p.y + this.offset.y,
            p.z + this.offset.z
        )
    }

}