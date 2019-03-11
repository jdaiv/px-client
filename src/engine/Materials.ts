import { mat4, vec2, vec4 } from 'gl-matrix'
import { gl, GLMesh } from './Video'
import errorFS from './shaders/error.fs'
import errorVS from './shaders/error.vs'
import hittestFS from './shaders/hittest.fs'
import hittestVS from './shaders/hittest.vs'
import outlineFS from './shaders/outline.fs'
import outlineVS from './shaders/outline.vs'
import postVS from './shaders/post.vs'
import postbloomFS from './shaders/post_bloom.fs'
import postnoneFS from './shaders/post_none.fs'
import postrainbowsFS from './shaders/post_rainbows.fs'
import postwobbleFS from './shaders/post_wobble.fs'
import texturedFS from './shaders/textured.fs'
import texturedVS from './shaders/textured.vs'

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
        vs: postVS,
        fs: postnoneFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: false,
        time: false,
    },
    post_bloom: {
        vs: postVS,
        fs: postbloomFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_rainbows: {
        vs: postVS,
        fs: postrainbowsFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_wobble: {
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

    private settings: any

    private vertexPosLoc: number
    private vertexNormalLoc: number
    private vertexUvLoc: number
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
        gl.enableVertexAttribArray(this.vertexPosLoc)
        if (this.settings.normals)
            gl.enableVertexAttribArray(this.vertexNormalLoc)
        if (this.settings.textured)
            gl.enableVertexAttribArray(this.vertexUvLoc)
    }

    public end() {
        gl.disableVertexAttribArray(this.vertexPosLoc)
        if (this.settings.normals)
            gl.disableVertexAttribArray(this.vertexNormalLoc)
        if (this.settings.textured)
            gl.disableVertexAttribArray(this.vertexUvLoc)
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

    public bindMesh(mesh: GLMesh) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer)
        gl.vertexAttribPointer(this.vertexPosLoc, 3, gl.FLOAT, false, 0, 0)
        if (this.settings.normals) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer)
            gl.vertexAttribPointer(this.vertexNormalLoc, 3, gl.FLOAT, true, 0, 0)
        }
        if (this.settings.textured) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvsBuffer)
            gl.vertexAttribPointer(this.vertexUvLoc, 2, gl.FLOAT, false, 0, 0)
        }
        this.numTris = mesh.verts.length / 3
    }

    public preDraw() {
        if (this.settings.cull === 0) gl.disable(gl.CULL_FACE)
        if (this.settings.cull === -1) gl.cullFace(gl.FRONT)
    }

    public draw() {
        gl.drawArrays(gl.TRIANGLES, 0, this.numTris)
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
