import { mat4, vec2, vec4 } from 'gl-matrix'
import Particles, { PARTICLE_COLOR_OFFSET, PARTICLE_POSITION_OFFSET,
    PARTICLE_SCALE_OFFSET, PARTICLE_STRIDE } from './Particles'
import errorFS from './shaders/error.fs'
import errorVS from './shaders/error.vs'
import hittestFS from './shaders/hittest.fs'
// import hittestVS from './shaders/hittest.vs'
import outlineFS from './shaders/outline.fs'
import outlineVS from './shaders/outline.vs'
import particleFS from './shaders/particle.fs'
import particleVS from './shaders/particle.vs'
import postVS from './shaders/post.vs'
import postbloomFS from './shaders/post_bloom.fs'
import postnoneFS from './shaders/post_none.fs'
import postrainbowsFS from './shaders/post_rainbows.fs'
import postwobbleFS from './shaders/post_wobble.fs'
import stencilFS from './shaders/stencil.fs'
import stencilVS from './shaders/stencil.vs'
import terrainFS from './shaders/terrain.fs'
import terrainVS from './shaders/terrain.vs'
import texturedFS from './shaders/textured.fs'
import texturedVS from './shaders/textured.vs'
import waterFS from './shaders/water.fs'
import waterVS from './shaders/water.vs'
import { gl, GLMesh } from './Video'

const MATERIALS = {
    error: {
        vs: errorVS,
        fs: errorFS,
        transform: true,

        textured: false,
        normals: false,
        spriteData: false,

        screenSize: false,
        time: true,
    },
    hitTest: {
        vs: texturedVS,
        fs: hittestFS,
        transform: true,

        textured: true,
        normals: true,
        spriteData: true,
        color: true,

        screenSize: false,
        time: true,

        manual: true,
    },
    stencil: {
        vs: stencilVS,
        fs: stencilFS,
        transform: true,
        manual: true,
    },
    textured: {
        vs: texturedVS,
        fs: texturedFS,
        transform: true,

        textured: true,
        normals: true,
        spriteData: true,

        screenSize: false,
        time: true,
    },
    terrain: {
        vs: terrainVS,
        fs: terrainFS,
        transform: true,

        textured: true,
        normals: false,
        spriteData: false,

        screenSize: false,
        time: true,

        manual: true,
    },
    water: {
        vs: waterVS,
        fs: waterFS,
        transform: true,

        textured: true,
        screenSize: true,
        time: true,

        manual: true,
    },
    sprite: {
        vs: texturedVS,
        fs: texturedFS,
        transform: true,
        cull: 0,

        textured: true,
        normals: true,
        spriteData: true,

        screenSize: false,
        time: true,
    },
    particle: {
        vs: particleVS,
        fs: particleFS,
        transform: true,
        cull: 0,
        particle: true,
        manual: true,
    },
    outline: {
        vs: outlineVS,
        fs: outlineFS,
        transform: true,
        cull: -1,

        textured: true,
        normals: true,

        screenSize: false,
        time: false,
    },
    post_none: {
        manual: true,
        vs: postVS,
        fs: postnoneFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: false,
        time: false,
    },
    post_bloom: {
        manual: true,
        vs: postVS,
        fs: postbloomFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_rainbows: {
        manual: true,
        vs: postVS,
        fs: postrainbowsFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_wobble: {
        manual: true,
        vs: postVS,
        fs: postwobbleFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
}

export class MaterialManager {

    public static load(): Map<string, Material> {
        const map = new Map<string, Material>()
        console.log('loading materials')
        for (const key in MATERIALS) {
            console.log('reading material:', key)
            map.set(key, new Material(MATERIALS[key]))
        }
        return map
    }

}

export class Material {

    private shader: Shader

    public settings: any

    private vertexPosLoc: number
    private vertexNormalLoc: number
    private vertexUvLoc: number
    private particlePosLoc: number
    private particleSizeLoc: number
    private particleColorLoc: number
    private numTris: number

    private vpMatLoc: WebGLUniformLocation
    private mMatLoc: WebGLUniformLocation
    private textureOneLoc: WebGLUniformLocation
    private spriteDataLoc: WebGLUniformLocation
    private colorLoc: WebGLUniformLocation
    private timeLoc: WebGLUniformLocation
    private screenSizeLoc: WebGLUniformLocation

    constructor(settings: any) {
        this.settings = settings
        this.shader = new Shader(settings.vs, settings.fs)
        const prog = this.shader.program

        this.vertexPosLoc = gl.getAttribLocation(prog, 'aVertexPosition')

        if (settings.normals)
            this.vertexNormalLoc = gl.getAttribLocation(prog, 'aVertexNormal')

        if (settings.transform) {
            this.vpMatLoc = gl.getUniformLocation(prog, 'uVP_Matrix')
            this.mMatLoc = gl.getUniformLocation(prog, 'uM_Matrix')
        }

        if (settings.textured) {
            this.vertexUvLoc = gl.getAttribLocation(prog, 'aTextureCoord')
            this.textureOneLoc = gl.getUniformLocation(prog, 'uSampler')
        }

        if (settings.particle) {
            this.particlePosLoc = gl.getAttribLocation(prog, 'aParticlePosition')
            this.particleSizeLoc = gl.getAttribLocation(prog, 'aParticleSize')
            this.particleColorLoc = gl.getAttribLocation(prog, 'aParticleColor')
        }

        if (settings.spriteData) {
            this.spriteDataLoc = gl.getUniformLocation(prog, 'uSpriteData')
        }

        if (settings.color) {
            this.colorLoc = gl.getUniformLocation(prog, 'uColor')
        }

        if (settings.time)
            this.timeLoc = gl.getUniformLocation(prog, 'uTime')

        if (settings.screenSize)
            this.screenSizeLoc = gl.getUniformLocation(prog, 'uScreenSize')

    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        if (this.settings.particle) {
            gl.disableVertexAttribArray(this.particlePosLoc)
            gl.disableVertexAttribArray(this.particleSizeLoc)
            gl.disableVertexAttribArray(this.particleColorLoc)
        } else {
            gl.disableVertexAttribArray(this.vertexPosLoc)
            if (this.settings.normals)
                gl.disableVertexAttribArray(this.vertexNormalLoc)
            if (this.settings.textured)
                gl.disableVertexAttribArray(this.vertexUvLoc)
        }
    }

    public setGlobalUniforms(data: any) {
        if (this.settings.transform)
            gl.uniformMatrix4fv(this.vpMatLoc, false, data.vpMatrix)
        if (this.settings.time)
            gl.uniform1f(this.timeLoc, data.time)
        if (this.settings.screenSize)
            gl.uniform2f(this.screenSizeLoc, data.width, data.height)
    }

    public setMeshUniforms(mMatrix: mat4, spriteData?: vec2, color?: vec4) {
        if (this.settings.transform)
            gl.uniformMatrix4fv(this.mMatLoc, false, mMatrix)
        if (this.settings.spriteData)
            gl.uniform2fv(this.spriteDataLoc, spriteData)
        if (this.settings.color)
            gl.uniform4fv(this.colorLoc, color)
    }

    public setTexture(tex: WebGLTexture) {
        if (this.settings.textured) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.uniform1i(this.textureOneLoc, 0)
        }
    }

    public bindMesh(mesh: GLMesh, numTris?: number) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer)
        gl.vertexAttribPointer(this.vertexPosLoc, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vertexPosLoc)
        if (this.settings.normals) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer)
            gl.vertexAttribPointer(this.vertexNormalLoc, 3, gl.FLOAT, true, 0, 0)
            gl.enableVertexAttribArray(this.vertexNormalLoc)
        }
        if (this.settings.textured) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvsBuffer)
            gl.vertexAttribPointer(this.vertexUvLoc, 2, gl.FLOAT, false, 0, 0)
            gl.enableVertexAttribArray(this.vertexUvLoc)
        }
        this.numTris = numTris !== undefined ? numTris : (mesh.verts.length / 3)
    }

    public bindParticles(p: Particles) {
        gl.bindBuffer(gl.ARRAY_BUFFER, p.glBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, p.buffer, gl.DYNAMIC_DRAW)

        gl.vertexAttribPointer(this.particlePosLoc, 4, gl.FLOAT, false,
            PARTICLE_STRIDE, PARTICLE_POSITION_OFFSET)
        gl.enableVertexAttribArray(this.particlePosLoc)

        gl.vertexAttribPointer(this.particleSizeLoc, 1, gl.FLOAT, false,
            PARTICLE_STRIDE, PARTICLE_SCALE_OFFSET)
        gl.enableVertexAttribArray(this.particleSizeLoc)

        gl.vertexAttribPointer(this.particleColorLoc, 4, gl.UNSIGNED_BYTE, true,
            PARTICLE_STRIDE, PARTICLE_COLOR_OFFSET)
        gl.enableVertexAttribArray(this.particleColorLoc)
    }

    public preDraw() {
        if (this.settings.cull === 0) gl.disable(gl.CULL_FACE)
        if (this.settings.cull === -1) gl.cullFace(gl.FRONT)
    }

    public draw() {
        if (this.numTris > 0) gl.drawArrays(gl.TRIANGLES, 0, this.numTris)
    }

    public postDraw() {
        if (this.settings.cull === 0) gl.enable(gl.CULL_FACE)
        if (this.settings.cull === -1) gl.cullFace(gl.BACK)
    }

}

class Shader {

    public program: WebGLProgram
    private vs: WebGLShader
    private fs: WebGLShader

    private vsSource: string
    private fsSource: string

    constructor(vs: string, fs: string) {
        this.vsSource = vs
        this.fsSource = fs
        this.linkShader()
    }

    public linkShader() {
        this.vs = this.load(gl.VERTEX_SHADER, this.vsSource)
        this.fs = this.load(gl.FRAGMENT_SHADER, this.fsSource)

        if (this.vs == null || this.fs == null) {
            throw new Error('Error compiling shader')
        }

        this.program = gl.createProgram()
        gl.attachShader(this.program, this.vs)
        gl.attachShader(this.program, this.fs)
        gl.linkProgram(this.program)

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Unable to init shader program: ' +
                gl.getProgramInfoLog(this.program))
            throw new Error('Error linking shader')
        }
    }

    public load(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(source)
            console.error('Error compiling shader: ' +
                gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
        }
        return shader
    }

}
