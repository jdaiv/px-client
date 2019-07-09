import { vec3 } from 'gl-matrix'
import Engine from '../Engine'
import GLFBO from './GLFBO'
import Emitter, { IEmitterOpts } from './particles/Emitter'
import { ParticleCreateMaterial, ParticleDrawMaterial, ParticleThinkMaterial } from './particles/Materials'
import pDrawFS from './shaders/particle.fs'
import pDrawVS from './shaders/particle.vs'
import pCreateFS from './shaders/particle_new.fs'
import pCreateVS from './shaders/particle_new.vs'
import pThinkFS from './shaders/particle_think.fs'
import pThinkVS from './shaders/particle_think.vs'
import { TILE_SIZE } from './Terrain'
import { gl } from './Video'

const TEX_SIZE = 2048
export const PARTICLE_SIZE = 8
const MAX_PARTICLES = TEX_SIZE * TEX_SIZE / PARTICLE_SIZE
const MAX_NEW_PARTICLES = 10000

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

export default class Particles {

    private engine: Engine
    private particles: IParticle[]

    private drawMaterial: ParticleDrawMaterial
    private createMaterial: ParticleCreateMaterial
    private thinkMaterial: ParticleThinkMaterial
    private framebuffer: WebGLFramebuffer
    private textureOne: WebGLTexture
    private textureTwo: WebGLTexture
    private flip = false

    public buffer: Float32Array
    public activeParticles = 0
    public offset = 0
    public newBuffer: Float32Array
    public newPointBuffer: Int32Array

    public glBuffer: WebGLBuffer
    public glNewBuffer: WebGLBuffer
    public glNewPointBuffer: WebGLBuffer

    constructor(engine: Engine) {
        this.engine = engine
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

        this.makeTexture(TEX_SIZE, TEX_SIZE)
    }

    private makeBuffers() {
        this.newPointBuffer = new Int32Array(TEX_SIZE * TEX_SIZE * 2)
        this.newBuffer = new Float32Array(MAX_NEW_PARTICLES * PARTICLE_SIZE * 4)

        let idx = 0
        for (let y = 0; y < TEX_SIZE; y++) {
            for (let x = 0; x < TEX_SIZE; x++) {
                this.newPointBuffer[idx++] = x
                this.newPointBuffer[idx++] = y
            }
        }

        const particleIndices = new Int32Array(MAX_PARTICLES * 2)
        idx = 0
        for (let y = 0; y < TEX_SIZE; y++) {
            for (let x = 0; x < TEX_SIZE; x += PARTICLE_SIZE) {
                particleIndices[idx++] = x
                particleIndices[idx++] = y
            }
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
        const blankTexture = new Float32Array(w * h * 4)

        gl.bindTexture(gl.TEXTURE_2D, this.textureOne)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F,
            w, h,
            0, gl.RGBA, gl.FLOAT, blankTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        gl.bindTexture(gl.TEXTURE_2D, this.textureTwo)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F,
            w, h,
            0, gl.RGBA, gl.FLOAT, blankTexture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    }

    public newEmitter(opts: IEmitterOpts): Emitter {
        return new Emitter(this, opts)
    }

    public getParticle(): IParticle {
        if (this.activeParticles >= MAX_NEW_PARTICLES) {
            this.activeParticles = 0
        }
        return this.particles[this.activeParticles++]
    }

    public draw(data: any, fbo: GLFBO) {
        for (let i = 0; i < this.activeParticles; i++) {
            const p = this.particles[i]
            const offset = i * PARTICLE_SIZE * 4
            // slot 0
            this.newBuffer[offset + 0] =     p.lifetime
            this.newBuffer[offset + 1] =     p.life
            this.newBuffer[offset + 2] =     p.startSize
            this.newBuffer[offset + 3] =     p.size
            // slot 1
            this.newBuffer[offset + 4] =     p.gravity[0]
            this.newBuffer[offset + 5] =     p.gravity[1]
            this.newBuffer[offset + 6] =     p.gravity[2]
            this.newBuffer[offset + 7] =     0
            // slot 2
            this.newBuffer[offset + 8] =     p.dampening[0]
            this.newBuffer[offset + 9] =     p.dampening[1]
            this.newBuffer[offset + 10] =    p.dampening[2]
            this.newBuffer[offset + 11] =    0
            // slot 3
            this.newBuffer[offset + 12] =    p.position[0]
            this.newBuffer[offset + 13] =    p.position[1]
            this.newBuffer[offset + 14] =    p.position[2]
            this.newBuffer[offset + 15] =    1
            // slot 4
            this.newBuffer[offset + 16] =    p.velocity[0]
            this.newBuffer[offset + 17] =    p.velocity[1]
            this.newBuffer[offset + 18] =    p.velocity[2]
            this.newBuffer[offset + 19] =    0
            // slot 5
            this.newBuffer[offset + 20] =    p.color[0] / 255
            this.newBuffer[offset + 21] =    p.color[1] / 255
            this.newBuffer[offset + 22] =    p.color[2] / 255
            this.newBuffer[offset + 23] =    p.color[3] / 255
            // slot 6
            this.newBuffer[offset + 24] =    p.bounce
            this.newBuffer[offset + 25] =    p.fadeTime
            this.newBuffer[offset + 26] =    Math.random() * 10000
            this.newBuffer[offset + 27] =    Math.random() * 10000
            // slot 7
            this.newBuffer[offset + 28] =    Math.random() * 10000
            this.newBuffer[offset + 29] =    Math.random() * 10000
            this.newBuffer[offset + 30] =    Math.random() * 10000
            this.newBuffer[offset + 31] =    Math.random() * 10000
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
        cT.bindParticlePoints(this.glNewPointBuffer)
        cT.draw(TEX_SIZE * TEX_SIZE)
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
        m.setParticleTexture(this.engine.resources.sprites.get('circle8').texture.tex)
        // gl.enable(gl.BLEND)
        // gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.ONE)
        // gl.blendFunc(gl.ONE, gl.ONE)
        // gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT)
        // gl.depthMask(false)
        gl.drawArrays(gl.POINTS, 0, MAX_PARTICLES)
        // gl.disable(gl.BLEND)
        // gl.depthMask(true)
        // gl.blendEquation(gl.FUNC_ADD)
        m.end()

        this.flip = !this.flip
    }

}
