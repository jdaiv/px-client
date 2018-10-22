import { vec3 } from 'gl-matrix'

import Entity from '../Entity'
import Sprite3D from '../components/Sprite3D'
import Resources from '../Resources'

const SPEED = 1

export default class Player extends Entity {

    velocity = vec3.create()

    constructor (name) {
        super(name)

        this.body = this.addComponent(new Sprite3D(Resources.images.poses))
        this.body.frame = 0
        this.face = this.addComponent(new Sprite3D(
            Resources.images.faces, 0, 0, 0.1))
        this.face.frame = 2
        this.faceTimer = 0

        this.keysDown = new Map()

        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)

        this.lastPostion = vec3.create()
    }

    tick (dt) {
        super.tick(dt)
        // this.face.offset[0] = Math.sin(this.engine.time / 800) * Math.sin(this.engine.time / 1600) * 2 - 1
        // this.face.frame = Math.floor(this.faceTimer += dt) % 5

        let targetVelocity = vec3.create()

        this.keysDown.forEach((v, k) => {
            if (!v) return
            switch (k) {
            case 'ArrowLeft':
                targetVelocity[0] = -SPEED
                break
            case 'ArrowRight':
                targetVelocity[0] = SPEED
                break
            case 'ArrowUp':
                targetVelocity[2] = -SPEED
                break
            case 'ArrowDown':
                targetVelocity[2] = SPEED
                break
            }
        })

        vec3.normalize(targetVelocity, targetVelocity)
        targetVelocity[1] = this.velocity[1]
        vec3.lerp(this.velocity, this.velocity, targetVelocity, dt * 10)

        this.velocity[1] -= 10 * dt
        vec3.add(this.position, this.position, this.velocity)
        if (this.position[1] <= 0) {
            this.position[1] = 0
            this.body.frame = 0
            this.face.offset[1] = 8
        } else {
            this.body.frame = 3
            this.face.offset[1] = 8
        }

        if (vec3.distance(this.position, this.lastPostion) > 1) {
            this.engine.me = {
                x: this.position[0],
                y: this.position[1],
                z: this.position[2],
            }
            this.engine.sendUpdate = true
            this.lastPostion = vec3.clone(this.position)
        }
    }

    keydown = (evt) => {
        this.keysDown.set(evt.code, true)
        if (evt.code == 'Space' && this.position[1] <= 0) {
            this.velocity[1] = 4
        }
    }

    keyup = (evt) => {
        this.keysDown.set(evt.code, false)
    }

}