import { vec3 } from 'gl-matrix'

import Component from '../Component'
import MaterialManager from '../Materials'

export default class Mesh3D extends Component {

    constructor (volume, x = 0, y = 0, z = 0) {
        super()
        this.volume = volume
        this.offset = vec3.set(vec3.create(), x, y, z)
        this.frame = 0
        // this.object = new GLObject3D(MaterialManager.materials.default)
        // this.object.setVerts(volume.verts)
    }

    draw (dt) {
        // this.object.position = vec3.add(vec3.create(), this.offset, this.parent.transform.position)
        // this.object.material = MaterialManager.materials.default
        // this.parent.engine.v.draw(this.object)
        // this.object.material = MaterialManager.materials.outline
        // this.parent.engine.v.draw(this.object)
    }

    remove () {
        super.remove()
        // this.object.destroy()
    }

}