import { quat, vec3 } from 'gl-matrix'
import Particles from '../Particles'

function randN(min: number, max: number) {
    return Math.random() * (max - min) + min
}

function randI() {
    return Math.random() * 2 - 1
}

export interface IEmitterOpts {
    position?: vec3
    size?: number[]
    lifetime?: number[]
    gravity?: vec3
    dampening?: vec3
    velocity?: number[]
    color?: number[]
    speed?: number
    spread?: number
    bounce?: number
    shape?: 'cube' | 'square' | 'sphere' | 'point'
    cube?: vec3
    rotation?: vec3
    outline?: boolean
    fadeTime?: number
}

export default class Emitter implements IEmitterOpts {

    private particles: Particles

    public position = vec3.create()
    public size: number[] = [1, 1]
    public lifetime: number[] = [1, 1]
    public gravity = vec3.create()
    public dampening = vec3.fromValues(1, 1, 1)
    public velocity: number[] = [0, 0]
    public color: number[] = [255, 255, 0, 255]
    public speed = 0
    public spread = 0
    public bounce = -1
    public shape: 'cube' | 'square' | 'sphere' | 'point' = 'point'
    public cube: vec3
    public outline = false
    public fadeTime = 0.01

    private angle = quat.create()

    public set rotation(v: vec3) {
        quat.fromEuler(this.angle, v[0], v[1], v[2])
    }

    constructor(particles: Particles, opts: IEmitterOpts) {
        this.particles = particles
        for (const key in opts) {
            this[key] = opts[key]
        }
    }

    public emit(count: number) {
        for (let i = 0; i < count; i++) {
            const p = this.particles.getParticle()
            p.gravity = this.gravity
            p.dampening = this.dampening
            p.size = p.startSize = randN(this.size[0], this.size[1])
            vec3.copy(p.position, this.position)
            if (this.shape !== 'point') {
                let offset: vec3
                switch (this.shape) {
                    case 'square':
                        if (this.outline) {
                            offset = vec3.create()
                            const side = Math.floor(randN(0, 4))
                            const axis = side % 2
                            const sideOne = this.cube[2] % 3
                            const sideTwo = (this.cube[2] + 1) % 3

                            offset[axis ? sideOne : sideTwo] =
                                (side > 1 ? 1 : -1) * (axis ? this.cube[0] : this.cube[1])

                            const rand = axis ? this.cube[1] : this.cube[0]
                            offset[axis ? sideTwo : sideOne] = randN(-rand, rand)
                        } else {
                            const rand = [
                                randN(-this.cube[0], this.cube[0]),
                                randN(-this.cube[1], this.cube[1]),
                                0
                            ]
                            offset = vec3.fromValues(
                                rand[(0 + this.cube[2]) % 3],
                                rand[(1 + this.cube[2]) % 3],
                                rand[(2 + this.cube[2]) % 3]
                            )
                        }
                        break
                    case 'cube':
                        if (this.outline) {
                            offset = vec3.create()
                            const side = Math.floor(randN(0, 6))
                            const axis = side % 3
                            offset[axis] = side > 2 ? 1 : -1
                            offset[(axis + 1) % 3] = randI()
                            offset[(axis + 2) % 3] = randI()
                            vec3.mul(offset, offset, this.cube)
                        } else {
                            offset = vec3.fromValues(
                                randN(-this.cube[0], this.cube[0]),
                                randN(-this.cube[1], this.cube[1]),
                                randN(-this.cube[2], this.cube[2])
                            )
                        }
                        break
                    case 'sphere':
                        offset = vec3.create()
                        vec3.random(offset)
                        if (this.outline) vec3.normalize(offset, offset)
                        vec3.mul(offset, offset, this.cube)
                        break
                }
                vec3.add(p.position, p.position, offset)
            }
            vec3.set(p.velocity,
                1,
                randN(-this.spread, this.spread),
                randN(-this.spread, this.spread)
            )
            vec3.normalize(p.velocity, p.velocity)
            vec3.transformQuat(p.velocity, p.velocity, this.angle)
            vec3.scale(p.velocity, p.velocity, randN(this.velocity[0], this.velocity[1]))
            p.color[0] = this.color[0]
            p.color[1] = this.color[1]
            p.color[2] = this.color[2]
            p.color[3] = 255
            p.lifetime = p.life = randN(this.lifetime[0], this.lifetime[1])
            p.bounce = this.bounce
            p.fadeTime = this.fadeTime
            count--
            if (count <= 0) return
        }
    }

}
