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

        this.networked = true
        this.networkId = id

        this.body = this.addComponent(new Sprite3D(Resources.images.poses))
        this.body.frame = 0
        this.face = this.addComponent(new Sprite3D(
            Resources.images.faces, 0, 0, 0.1))
        this.face.frame = 2
        this.faceTimer = 0

        this.overlay = this.engine.overlay.addPoint(this)
        this.overlay.titleOffset[1] = 10

        this.update(owner)
    }

    destroy () {
        this.engine.overlay.removePoint(this)
        super.destroy()
    }

    update (owner) {
        const old = this.isAuthority
        this.isAuthority = owner === Services.auth.store.usernameN
        if (old != this.isAuthority) {
            if (this.isAuthority) {
                this.keysDown = new Map()

                window.addEventListener('keydown', this.keydown)
                window.addEventListener('keyup', this.keyup)

                this.lastPostion = vec3.create()
            } else {
                window.removeEventListener('keydown', this.keydown)
                window.removeEventListener('keyup', this.keyup)
            }
        }

        this.overlay.title = owner
    }

    tick (dt) {
        if (this.isAuthority) {
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
            vec3.mul(targetVelocity, targetVelocity, [SPEED, SPEED, SPEED])
            targetVelocity[1] = this.controller.velocity[1]
            vec3.lerp(this.controller.velocity, this.controller.velocity, targetVelocity, dt * 10)


        }

        super.tick(dt)

        if (this.isAuthority) {
            if (this.controller.grounded) {
                if (vec3.length(this.controller.velocity) > 0.3) {
                    this.faceTimer += dt * 10
                    this.animState = this.faceTimer % 2
                } else {
                    this.animState = 0
                }
            } else {
                this.animState = 3
            }

            if (vec3.distance(this.position, this.lastPostion) > 0.01) {
                this.networkDirty = true
                this.lastPostion = vec3.clone(this.position)
            }
        }

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
        if (evt.code == 'Space' && this.controller.grounded) {
            this.controller.velocity[1] = 300
            this.engine.synth.channel[0].playNote(103.83)
        }
    }

    keyup = (evt) => {
        this.keysDown.set(evt.code, false)
    }

    /* eslint-disable camelcase */
    networkRecv ({ transform, velocity, animation_state, user }) {
        super.networkRecv()
        if (!this.isAuthority){
            vec3.set(this.position,
                transform.position.x,
                transform.position.y,
                transform.position.z)
            vec3.set(this.controller.velocity,
                velocity.x,
                velocity.y,
                velocity.z)
            this.animState = animation_state
        }

        this.update(user)
    }
    /* eslint-enable */

    networkSend () {
        if (!this.networkDirty) return []

        super.networkSend()

        return [
            this.position[0],
            this.position[1],
            this.position[2],
            this.velocity[0],
            this.velocity[1],
            this.velocity[2],
            this.animState
        ]
    }

}