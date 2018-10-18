import Entity from '../Entity'
import Sprite3D from '../components/Sprite3D'
import Resources from '../Resources'

export default class Player extends Entity {

    constructor (name) {
        super(name)

        this.body = this.addComponent(new Sprite3D(Resources.images.poses))
        this.body.frame = 6
        this.face = this.addComponent(new Sprite3D(
            Resources.images.faces, -1, 5, 1))
        this.face.frame = 3
    }

    tick (dt) {
        super.tick(dt)
        this.face.offset.x = Math.sin(this.engine.time / 400) * Math.sin(this.engine.time / 800) * 2 - 1
    }

}