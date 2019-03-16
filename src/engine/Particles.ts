import { mat4, quat, vec3 } from 'gl-matrix'
import { Material } from './Materials'
import Util from './Util'
import { gl, GLMesh } from './Video'

const MAX_PARTICLES = 50000
const QUAD_VERTS = 6
const one = vec3.fromValues(1, 1, 1)

export const PARTICLE_STRIDE = (
    4 * 4 + // position f32[4]
    4 * 4 + // scale f32[4]
    1 * 4 + // rotation f32[1]
    4 * 1 // color byte[4]
)
export const PARTICLE_POSITION_OFFSET = 0
export const PARTICLE_SCALE_OFFSET = 16
export const PARTICLE_ROTATION_OFFSET = 32
export const PARTICLE_COLOR_OFFSET = 36

class Particle {
    public active: boolean
    public pause = false

    public position = vec3.create()
    public gravity = vec3.create()
    public dampening = vec3.create()
    public velocity = vec3.create()
    public size = 1
    public scale = vec3.create()
    public color = [0, 0, 0, 255]
    public life = 0
    public lifetime = 0
    public bounce = -1

    constructor() {
        this.active = false
    }

    public tick(dt: number) {
        if (! this.active) return
        this.life -= dt
        if (this.life <= 0) {
            this.active = false
            return
        }
        vec3.scale(this.scale, one, this.life / this.lifetime * this.size)
        this.color[3] = this.life / this.lifetime * 255
        if (!this.pause) {
            vec3.scaleAndAdd(this.velocity, this.velocity, this.gravity, dt)
            vec3.mul(this.velocity, this.velocity, this.dampening)
            vec3.scaleAndAdd(this.position, this.position, this.velocity, dt)
            if (this.bounce >= 0 && this.position[1] < 0) {
                this.position[1] *= -1
                this.velocity[1] *= -1
                vec3.scale(this.velocity, this.velocity, this.bounce)
                if (vec3.len(this.velocity) < 1) {
                    this.pause = true
                }
            }
        }
    }
}

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
}

export class Emitter implements IEmitterOpts {

    private particles: Particle[]

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

    private angle = quat.create()

    public set rotation(v: vec3) {
        quat.fromEuler(this.angle, v[0], v[1], v[2])
    }

    constructor(particles: Particle[], opts: IEmitterOpts) {
        this.particles = particles
        for (const key in opts) {
            this[key] = opts[key]
        }
    }

    public emit(count: number) {
        for (const p of this.particles) {
            if (p.active) continue
            p.gravity = this.gravity
            p.dampening = this.dampening
            p.size = randN(this.size[0], this.size[1])
            vec3.copy(p.position, this.position)
            if (this.shape !== 'point') {
                let offset: vec3
                switch (this.shape) {
                    case 'square':
                        if (this.outline) {
                            offset = vec3.create()
                            const side = Math.floor(randN(0, 4))
                            const axis = side % 2
                            offset[axis ? 1 : 2] = side > 1 ? 1 : -1
                            offset[axis ? 2 : 1] = randI()
                            vec3.mul(offset, offset, this.cube)
                        } else {
                            offset = vec3.fromValues(
                                0,
                                randN(-this.cube[0], this.cube[0]),
                                randN(-this.cube[1], this.cube[1])
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
                vec3.transformQuat(offset, offset, this.angle)
                vec3.add(p.position, p.position, offset)
            }
            vec3.set(p.velocity,
                1,
                randN(-this.spread, this.spread),
                randN(-this.spread, this.spread)
            )
            vec3.normalize(p.velocity, p.velocity)
            vec3.scale(p.velocity, p.velocity, randN(this.velocity[0], this.velocity[1]))
            vec3.transformQuat(p.velocity, p.velocity, this.angle)
            p.color[0] = this.color[0]
            p.color[1] = this.color[1]
            p.color[2] = this.color[2]
            p.life = p.lifetime = randN(this.lifetime[0], this.lifetime[1])
            p.active = true
            p.pause = false
            p.bounce = this.bounce
            count--
            if (count <= 0) return
        }
    }

}

export default class Particles {

    private particles: Particle[]

    public mesh: GLMesh
    public material: Material
    private mMesh: mat4

    public buffer: ArrayBuffer
    private bufView: DataView
    private activeParticles = 0

    public glBuffer: WebGLBuffer

    constructor(mat: Material) {
        this.particles = new Array(MAX_PARTICLES)
        for (let i = 0; i < MAX_PARTICLES; i++) {
            this.particles[i] = new Particle()
        }

        this.material = mat
        this.mesh = new GLMesh(Util.makeQuad(-0.5, -0.5, 0.5, 0.5, MAX_PARTICLES))
        this.makeBuffers()
        this.bufView = new DataView(this.buffer)
        this.mMesh = mat4.fromRotationTranslationScale(
            mat4.create(),
            quat.create(),
            vec3.create(),
            vec3.fromValues(2, 2, 2))
    }

    private makeBuffers() {
        // 6 verts in a quad
        this.buffer = new ArrayBuffer(MAX_PARTICLES * QUAD_VERTS * PARTICLE_STRIDE)
        this.glBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.buffer, gl.DYNAMIC_DRAW)
    }

    public newEmitter(opts: IEmitterOpts): Emitter {
        return new Emitter(this.particles, opts)
    }

    public tick(dt: number) {
        const v = this.bufView
        let idx = 0
        this.particles.forEach((p) => {
            if (!p.active) return
            p.tick(dt)
            if (!p.active) return

            const pos = p.position
            const scale = p.scale
            const color = p.color
            for (let j = 0; j < QUAD_VERTS; j++) {
                v.setFloat32(PARTICLE_STRIDE * idx, pos[0], true)
                v.setFloat32(PARTICLE_STRIDE * idx + 4, pos[1], true)
                v.setFloat32(PARTICLE_STRIDE * idx + 8, pos[2], true)
                v.setFloat32(PARTICLE_STRIDE * idx + 12, 1, true)
                v.setFloat32(PARTICLE_STRIDE * idx + PARTICLE_SCALE_OFFSET + 0, scale[0], true)
                v.setFloat32(PARTICLE_STRIDE * idx + PARTICLE_SCALE_OFFSET + 4, scale[1], true)
                v.setFloat32(PARTICLE_STRIDE * idx + PARTICLE_SCALE_OFFSET + 8, scale[2], true)
                v.setFloat32(PARTICLE_STRIDE * idx + PARTICLE_SCALE_OFFSET + 12, 1, true)
                v.setUint8(PARTICLE_STRIDE * idx + PARTICLE_COLOR_OFFSET + 0, color[0])
                v.setUint8(PARTICLE_STRIDE * idx + PARTICLE_COLOR_OFFSET + 1, color[1])
                v.setUint8(PARTICLE_STRIDE * idx + PARTICLE_COLOR_OFFSET + 2, color[2])
                v.setUint8(PARTICLE_STRIDE * idx + PARTICLE_COLOR_OFFSET + 3, color[3])
                idx++
            }
        })

        this.activeParticles = idx
    }

    public draw(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data)
        m.bindMesh(this.mesh, this.activeParticles)
        m.setMeshUniforms(this.mMesh)
        m.bindParticles(this)
        m.draw()
        m.end()
    }

}
