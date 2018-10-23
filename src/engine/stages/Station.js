import { vec3 } from 'gl-matrix'

import Stage from '../Stage'
import Entity from '../Entity'
import Resources from '../Resources'
import Player from '../entities/Player'
import Sprite3D from '../components/Sprite3D'
import Volume3D from '../components/Volume3D'
import { platform, train } from '../volumes/Station'

export default class Station extends Stage {

    constructor (engine) {
        super(engine)

        this.edge = this.makeVolume('platform', platform)
        this.train = this.makeVolume('train', train)
        this.train.position[0] = -600
        this.train.position[1] = -32
        this.train.position[2] = 60

        this.trainSign = this.makeSprite('trainSign', 'trainSign', 0, 0, 0)

        this.makeSprite('fence', 'fence', 0, 0, 0)
        this.makeSprite('bin', 'bin', 24, 0, 10 + 0.01)
        this.makeSprite('seat', 'seat', 0, 0, 11 - 0.01)
        this.makeSprite('door', 'door', -30, 0, 10 + 0.01)
        this.makeSprite('posters', 'posters', 30, 24, 10 + 0.01)

        this.trainTarget = 0
    }

    makeSprite (name, imgName, x, y, z) {
        const ent = new Entity(name)
        ent.position[0] = x
        ent.position[1] = y
        ent.position[2] = z
        ent.addComponent(new Sprite3D(Resources.images[imgName]))
        this.addEntity(ent)
        return ent
    }

    makeVolume (name, volume) {
        const ent = new Entity(name)
        ent.addComponent(new Volume3D(volume))
        this.addEntity(ent)
        return ent
    }

    tick (dt) {
        super.tick(dt)

        let pos = vec3.clone(this.train.position)

        pos[0] = this.trainTarget

        this.train.position = vec3.lerp(
            this.train.position,
            this.train.position,
            pos,
            dt
        )

        let signPos = vec3.clone(this.train.position)
        signPos[2] += 16
        signPos[1] += 18
        this.trainSign.position = signPos
    }

    draw (dt) {
        super.draw(dt)
    }

}