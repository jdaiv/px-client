import { vec3 } from 'gl-matrix'

import Component from '../Component'
import { GLObject3DSprite } from '../Video'
import MaterialManager from '../MaterialManager'

export default class Sprite3D extends Component {

    constructor (img, x = 0, y = 0, z = 0) {
        super()
        this.img = img
        this.offset = vec3.set(vec3.create(), x, y, z)
        this.frame = 0
        this.object = new GLObject3DSprite(MaterialManager.materials.defaultSprite)
        this.object.setTexture(img.tex)

        this.uvOffset = (this.img.width / (this.img.frames > 0 ? this.img.frames : 1) / this.img.width)

        const _x = this.img.dim.w / 2
        const _y = this.img.dim.h
        const _h = this.img.height

        this.object.setVerts([
            -_x, -_h + _y,
            _x, _y,
            -_x, _y,
            -_x, -_h + _y,
            _x, -_h + _y,
            _x, _y,
        ])
    }

    draw (dt) {
        const uvX = this.uvOffset * this.frame
        const uvX2 = this.uvOffset * (this.frame + 1)

        this.object.setUVs([
            uvX, 1,
            uvX2, 0,
            uvX, 0,
            uvX, 1,
            uvX2, 1,
            uvX2, 0,
        ])

        this.object.position = vec3.add(vec3.create(), this.offset, this.parent.position)
        this.parent.engine.v.drawVolume(this.object)
    }

}