import { vec3 } from 'gl-matrix'

import Stage from '../Stage'
import Entity from '../Entity'
import Resources from '../Resources'
import Sprite3D from '../components/Sprite3D'
import Volume3D from '../components/Volume3D'
import { platform, train } from '../volumes/Station'

const OFFSET = -24

export default class Station extends Stage {

    constructor (engine) {
        super(engine)

        this.edge = this.makeVolume('platform', platform, 0, 0, OFFSET, true)
        this.train = this.makeVolume('train', train, -600, -32, 60 + OFFSET)
        this.trainSign = this.makeSprite('trainSign', 'trainSign', 0, 0, 0 + OFFSET)

        this.makeSprite('fence', 'fence', 0, 0, 0 + OFFSET)
        this.makeSprite('bin', 'bin', 24, 0, 10 + 0.01 + OFFSET)
        this.makeSprite('seat', 'seat', 0, 0, 11 - 0.01 + OFFSET)
        this.makeSprite('door', 'door', -30, 0, 10 + 0.01 + OFFSET)
        this.makeSprite('posters', 'posters', 30, 24, 10 + 0.01 + OFFSET)

        this.trainTarget = 0
    }

    makeSprite (name, imgName, x = 0, y = 0, z = 0) {
        const ent = new Entity(this.engine, name)
        ent.transform.position[0] = x
        ent.transform.position[1] = y
        ent.transform.position[2] = z
        ent.addComponent('v', new Sprite3D(Resources.images[imgName]))
        this.addEntity(ent)
        return ent
    }

    makeVolume (name, volume, x = 0, y = 0, z = 0, colliders = false) {
        const ent = new Entity(this.engine, name)
        ent.transform.position[0] = x
        ent.transform.position[1] = y
        ent.transform.position[2] = z
        ent.addComponent('v', new Volume3D(volume))
        this.addEntity(ent)
        return ent
    }

    tick (dt) {
        super.tick(dt)

        // let pos = vec3.clone(this.train.position)

        // pos[0] = this.trainTarget

        // this.train.position = vec3.lerp(
        //     this.train.position,
        //     this.train.position,
        //     pos,
        //     dt
        // )

        // let signPos = vec3.clone(this.train.position)
        // signPos[2] += 16
        // signPos[1] += 18
        // this.trainSign.position = signPos
    }

    draw (dt) {
        super.draw(dt)
    }

}