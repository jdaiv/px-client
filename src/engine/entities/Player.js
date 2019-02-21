import { vec3 } from 'gl-matrix'

import Entity from '../Entity'
import Sprite3D from '../components/Sprite3D'
import Resources from '../Resources'
import Services from '../../services'

const SPEED = 60

export default class Player extends Entity {

    velocity = vec3.create()

    constructor (engine, name, id, owner) {
        super(engine, name)

        this.body = this.addComponent('body', new Sprite3D(Resources.images.poses))
        this.body.frame = 0
        this.face = this.addComponent('face', new Sprite3D(
            Resources.images.faces, 0, 0, 0.5))
        this.face.frame = 4
        this.faceTimer = 0

        this.keysDown = new Map()
        this.velocity = vec3.create()

        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)
    }

    destroy () {
        window.removeEventListener('keydown', this.keydown)
        window.removeEventListener('keyup', this.keyup)

        super.destroy()
    }

    tick (dt) {
        let targetVelocity = vec3.create()

        this.keysDown.forEach((v, k) => {
            if (!v) return
            switch (k) {
            case 'ArrowLeft':
                targetVelocity[0] = -1
                break
            case 'ArrowRight':
                targetVelocity[0] = 1
                break
            case 'ArrowUp':
                targetVelocity[2] = -1
                break
            case 'ArrowDown':
                targetVelocity[2] = 1
                break
            }
        })

        vec3.normalize(targetVelocity, targetVelocity)
        vec3.mul(targetVelocity, targetVelocity, [SPEED * dt, SPEED * dt, SPEED * dt])
        vec3.add(this.transform.position, this.transform.position, targetVelocity)
        if (vec3.length(targetVelocity) > 0) {
            this.faceTimer += dt * 5
            this.animState = this.faceTimer % 2
        } else {
            this.animState = 0
        }

        super.tick(dt)

        this.engine.camera.target = vec3.clone(this.transform.worldPosition)

        switch (Math.round(this.animState)) {
        case 3:
            this.body.frame = 3
            this.face.offset[1] = 8
            break
        case 1:
            this.body.frame = 1
            this.face.offset[1] = 7
            break
        default:
            this.body.frame = 0
            this.face.offset[1] = 8
        }
    }

    keydown = (evt) => {
        this.keysDown.set(evt.code, true)
    }

    keyup = (evt) => {
        this.keysDown.set(evt.code, false)
    }

}