import { vec3 } from 'gl-matrix'

import Entity from '../Entity'
import Sprite3D from '../components/Sprite3D'
import Resources from '../Resources'

export default class FireworkLauncher extends Entity {

    constructor (engine, name, id) {
        super(engine, name)

        this.networked = true
        this.networkId = id

        this.display = this.addComponent(new Sprite3D(Resources.images.bin))
    }

    tick (dt) {
        super.tick(dt)
    }

    networkRecv ({ transform }) {
        vec3.set(this.position,
            transform.position.x,
            transform.position.y,
            transform.position.z)
    }

}