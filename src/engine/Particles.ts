import { mat4, quat, vec3 } from 'gl-matrix'
import { Shader } from './Materials'
import pDrawFS from './shaders/particle.fs'
import pDrawVS from './shaders/particle.vs'
import pCreateFS from './shaders/particle_new.fs'
import pCreateVS from './shaders/particle_new.vs'
import pThinkFS from './shaders/particle_think.fs'
import pThinkVS from './shaders/particle_think.vs'
import { TILE_SIZE } from './Terrain'
import { gl, GLFBO, GLMesh } from './Video'

const MAX_NEW_PARTICLES = 10000
const TEX_SIZE = 2048
export const PARTICLE_SIZE = 32
const MAX_PARTICLES = TEX_SIZE * TEX_SIZE / PARTICLE_SIZE

interface IParticle {
    gravity: vec3
    dampening: vec3
    position: vec3
    velocity: vec3
    size: number
    startSize: number
    color: number[]
    lifetime: number
    life: number
    bounce: number
    fadeTime: number
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
    fadeTime?: number
}

export class Emitter implements IEmitterOpts {

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

export default class Particles {

    private particles: IParticle[]

    private drawMaterial: ParticleDrawMaterial
    private createMaterial: ParticleCreateMaterial
    private thinkMaterial: ParticleThinkMaterial
    private framebuffer: WebGLFramebuffer
    private textureOne: WebGLTexture
    private textureTwo: WebGLTexture
    private flip = false

    public mesh: GLMesh

    public buffer: Float32Array
    public activeParticles = 0
    public offset = 0
    public newBuffer: Float32Array
    public newPointBuffer: Float32Array

    public glBuffer: WebGLBuffer
    public glNewBuffer: WebGLBuffer
    public glNewPointBuffer: WebGLBuffer

    constructor() {
        this.particles = new Array(MAX_NEW_PARTICLES)
        for (let i = 0; i < MAX_NEW_PARTICLES; i++) {
            this.particles[i] = {
                position: vec3.create(),
                gravity: vec3.create(),
                dampening: vec3.create(),
                velocity: vec3.create(),
                startSize: 1,
                size: 1,
                color: [0, 0, 0, 255],
                lifetime: 0,
                life: 0,
                bounce: -1,
                fadeTime: 0.05,
            }
        }

        this.drawMaterial = new ParticleDrawMaterial(pDrawVS, pDrawFS)
        this.createMaterial = new ParticleCreateMaterial(pCreateVS, pCreateFS)
        this.thinkMaterial = new ParticleThinkMaterial(pThinkVS, pThinkFS)
        this.makeBuffers()

        this.framebuffer = gl.createFramebuffer()
        this.textureOne = gl.createTexture()
        this.textureTwo = gl.createTexture()

        this.mesh = new GLMesh({
            verts: [
                -1, -1, 0,
                1, 1, 0,
                -1, 1, 0,
                -1, -1, 0,
                1, -1, 0,
                1, 1, 0,
            ],
            uvs: [
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,
            ]
        })
        this.makeTexture(TEX_SIZE, TEX_SIZE)
    }

    private makeBuffers() {
        this.newPointBuffer = new Float32Array(TEX_SIZE * TEX_SIZE)
        this.newBuffer = new Float32Array(MAX_NEW_PARTICLES * PARTICLE_SIZE)

        const border = 0
        for (let x = border; x < TEX_SIZE - border; x++) {
            for (let y = border; y < TEX_SIZE - border; y++) {
                const idx = y * TILE_SIZE + x
                this.newPointBuffer[idx] = idx
            }
        }

        const particleIndices = new Float32Array(MAX_PARTICLES)
        for (let i = 0; i < MAX_PARTICLES; i++) {
            particleIndices[i] = i * PARTICLE_SIZE
        }

        this.glBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, particleIndices, gl.STATIC_DRAW)
        this.glNewBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glNewBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.newBuffer, gl.DYNAMIC_DRAW)
        this.glNewPointBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glNewPointBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.newPointBuffer, gl.STATIC_DRAW)
    }

    public makeTexture(w: number, h: number) {
        const blankTexture = new Uint8Array(w * h * 4)
        for (let i = 0; i < w * h; i++) {
            const idx = i * 4
            blankTexture[idx + 0] = 125
            blankTexture[idx + 1] = 125
            blankTexture[idx + 2] = 0
            blankTexture[idx + 3] = 0
        }

        gl.bindTexture(gl.TEXTURE_2D, this.textureOne)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            w, h,
            0, gl.RGBA, gl.UNSIGNED_BYTE, blankTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        gl.bindTexture(gl.TEXTURE_2D, this.textureTwo)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            w, h,
            0, gl.RGBA, gl.UNSIGNED_BYTE, blankTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    public newEmitter(opts: IEmitterOpts): Emitter {
        return new Emitter(this, opts)
    }

    public getParticle(): IParticle {
        return this.particles[this.activeParticles++]
    }

    public draw(data: any, fbo: GLFBO) {
        for (let i = 0; i < this.activeParticles; i++) {
            const p = this.particles[i]
            const offset = i * PARTICLE_SIZE
            this.newBuffer[offset + 0] =    p.gravity[0]
            this.newBuffer[offset + 1] =    p.gravity[1]
            this.newBuffer[offset + 2] =    p.gravity[2]
            this.newBuffer[offset + 3] =    p.dampening[0]
            this.newBuffer[offset + 4] =    p.dampening[1]
            this.newBuffer[offset + 5] =    p.dampening[2]
            this.newBuffer[offset + 6] =    p.position[0]
            this.newBuffer[offset + 7] =    p.position[1]
            this.newBuffer[offset + 8] =    p.position[2]
            this.newBuffer[offset + 9] =    p.velocity[0]
            this.newBuffer[offset + 10] =   p.velocity[1]
            this.newBuffer[offset + 11] =   p.velocity[2]
            this.newBuffer[offset + 12] =   p.startSize
            this.newBuffer[offset + 13] =   p.size
            this.newBuffer[offset + 14] =   p.color[0] / 255
            this.newBuffer[offset + 15] =   p.color[1] / 255
            this.newBuffer[offset + 16] =   p.color[2] / 255
            this.newBuffer[offset + 17] =   p.color[3] / 255
            this.newBuffer[offset + 18] =   p.lifetime
            this.newBuffer[offset + 19] =   p.life
            this.newBuffer[offset + 20] =   p.bounce
            this.newBuffer[offset + 21] =   p.fadeTime
            for (let j = 22; j < 32; j++) {
                this.newBuffer[offset + j] = Math.random() * 10000
            }
        }

        gl.viewport(0, 0, TEX_SIZE, TEX_SIZE)
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)

        gl.disable(gl.DEPTH_TEST)

        if (this.activeParticles > 0) {
            const cM = this.createMaterial
            cM.use()
            cM.setGlobalUniforms(TEX_SIZE, this.offset)
            cM.bindParticlePoints(this.glNewPointBuffer)
            cM.bindParticleData(this.glNewBuffer, this.newBuffer)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, this.textureOne, 0)
            cM.draw(this.activeParticles * PARTICLE_SIZE)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, this.textureTwo, 0)
            cM.draw(this.activeParticles * PARTICLE_SIZE)
            cM.end()

            this.offset = (this.offset + this.activeParticles * PARTICLE_SIZE) % (TEX_SIZE * TEX_SIZE)
            this.activeParticles = 0
        }

        if (this.flip) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, this.textureOne, 0)
        } else {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                gl.TEXTURE_2D, this.textureTwo, 0)
        }

        const cT = this.thinkMaterial
        cT.use()
        if (this.flip) {
            this.thinkMaterial.setTexture(this.textureTwo)
        } else {
            this.thinkMaterial.setTexture(this.textureOne)
        }
        cT.setGlobalUniforms(TEX_SIZE, data.dt)
        cT.bindMesh(this.mesh)
        cT.draw(6)
        cT.end()

        gl.viewport(0, 0, data.width, data.height)
        fbo.bind()
        gl.enable(gl.DEPTH_TEST)

        const m = this.drawMaterial
        m.use()
        m.setGlobalUniforms(data.vpMatrix, TEX_SIZE)
        m.bindParticlePoints(this.glBuffer)
        if (this.flip) {
            m.setTexture(this.textureOne)
        } else {
            m.setTexture(this.textureTwo)
        }
        gl.enable(gl.BLEND)
        gl.depthMask(false)
        gl.drawArrays(gl.POINTS, 0, MAX_PARTICLES)
        gl.disable(gl.BLEND)
        gl.depthMask(true)
        m.end()

        this.flip = !this.flip
    }

}

class ParticleCreateMaterial {

    private shader: Shader

    private pointLoc: number
    private particleDataLoc: number
    private offsetLoc: WebGLUniformLocation
    private texSizeLoc: WebGLUniformLocation

    constructor(vs: string, fs: string) {
        this.shader = new Shader(vs, fs)
        const prog = this.shader.program

        this.pointLoc = gl.getAttribLocation(prog, 'aPoint')
        this.particleDataLoc = gl.getAttribLocation(prog, 'aData')
        this.offsetLoc = gl.getUniformLocation(prog, 'uOffset')
        this.texSizeLoc = gl.getUniformLocation(prog, 'uTexSize')
    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        gl.disableVertexAttribArray(this.pointLoc)
        gl.disableVertexAttribArray(this.particleDataLoc)
    }

    public setGlobalUniforms(size: number, offset: number) {
        gl.uniform1f(this.texSizeLoc, size)
        gl.uniform1f(this.offsetLoc, offset)
    }

    public bindParticlePoints(buf: WebGLBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.vertexAttribPointer(this.pointLoc, 1, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.pointLoc)
    }

    public bindParticleData(buf: WebGLBuffer, data: Float32Array) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(this.particleDataLoc, 1, gl.FLOAT, false, 4, 0)
        gl.enableVertexAttribArray(this.particleDataLoc)
    }

    public draw(num: number) {
       gl.drawArrays(gl.POINTS, 0, num)
    }

}

class ParticleThinkMaterial {

    private shader: Shader

    private vertexPosLoc: number
    private vertexUvLoc: number
    private timeLoc: WebGLUniformLocation
    private texSizeLoc: WebGLUniformLocation
    private textureOneLoc: WebGLUniformLocation

    constructor(vs: string, fs: string) {
        this.shader = new Shader(vs, fs)
        const prog = this.shader.program

        this.vertexPosLoc = gl.getAttribLocation(prog, 'aVertexPosition')
        this.vertexUvLoc = gl.getAttribLocation(prog, 'aTextureCoord')
        this.timeLoc = gl.getUniformLocation(prog, 'uTime')
        this.texSizeLoc = gl.getUniformLocation(prog, 'uTexSize')
        this.textureOneLoc = gl.getUniformLocation(prog, 'uTexture')
    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        gl.disableVertexAttribArray(this.vertexPosLoc)
        gl.disableVertexAttribArray(this.vertexUvLoc)
    }

    public setGlobalUniforms(size: number, dt: number) {
        gl.uniform1f(this.texSizeLoc, size)
        gl.uniform1f(this.timeLoc, dt)
    }

    public bindMesh(mesh: GLMesh) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer)
        gl.vertexAttribPointer(this.vertexPosLoc, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vertexPosLoc)
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvsBuffer)
        gl.vertexAttribPointer(this.vertexUvLoc, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vertexUvLoc)
    }

    public setTexture(tex: WebGLTexture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.uniform1i(this.textureOneLoc, 0)
    }

    public draw(num: number) {
       gl.drawArrays(gl.TRIANGLES, 0, num)
    }

}

class ParticleDrawMaterial {

    private shader: Shader

    private vpMatLoc: WebGLUniformLocation
    private pointLoc: number
    private texSizeLoc: WebGLUniformLocation
    private textureOneLoc: WebGLUniformLocation

    constructor(vs: string, fs: string) {
        this.shader = new Shader(vs, fs)
        const prog = this.shader.program

        this.pointLoc = gl.getAttribLocation(prog, 'aPoint')
        this.vpMatLoc = gl.getUniformLocation(prog, 'uVP_Matrix')
        this.texSizeLoc = gl.getUniformLocation(prog, 'uTexSize')
        this.textureOneLoc = gl.getUniformLocation(prog, 'uTexture')
    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        gl.disableVertexAttribArray(this.pointLoc)
    }

    public setGlobalUniforms(matrix: mat4, size: number) {
        gl.uniformMatrix4fv(this.vpMatLoc, false, matrix)
        gl.uniform1f(this.texSizeLoc, size)
    }

    public bindParticlePoints(buf: WebGLBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.vertexAttribPointer(this.pointLoc, 1, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.pointLoc)
    }

    public setTexture(tex: WebGLTexture) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.uniform1i(this.textureOneLoc, 0)
    }

    public draw(num: number) {
       gl.drawArrays(gl.POINTS, 0, num)
    }

}
