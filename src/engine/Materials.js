import Resources from './Resources'
import { gl } from './Video'

const MATERIALS = {
    textured: {
        vs: 'textured_vs',
        fs: 'textured_fs',
        transform: true,

        textured: true,
        normals: true,
        spriteData: true,

        screenSize: false,
        time: true,
    },
    outline: {
        vs: 'outline_vs',
        fs: 'outline_fs',
        transform: true,
        cull: -1,

        textured: true,
        normals: true,

        screenSize: false,
        time: false,
    },
    post: {
        vs: 'post_vs',
        fs: 'post_fs',
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
}

export default class MaterialManager {

    static load () {
        console.log('loading materials')
        this.materials = {}
        for (let key in MATERIALS) {
            console.log('reading material:', key)
            this.materials[key] = new Material(MATERIALS[key])
        }
    }

}

class Material {

    constructor (settings) {
        this.settings = settings
        this.shader = new Shader(
            Resources.texts[settings.vs],
            Resources.texts[settings.fs]
        )
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

        if (settings.time)
            this.timeLoc = gl.getUniformLocation(prog, 'uTime')

        if (settings.screenSize)
            this.screenSizeLoc = gl.getUniformLocation(prog, 'uScreenSize')

    }

    use () {
        gl.useProgram(this.shader.program)
        gl.enableVertexAttribArray(this.vertexPosLoc)
        if (this.settings.normals)
            gl.enableVertexAttribArray(this.vertexNormalLoc)
        if (this.settings.textured)
            gl.enableVertexAttribArray(this.vertexUvLoc)
    }

    end () {
        gl.disableVertexAttribArray(this.vertexPosLoc)
        if (this.settings.normals)
            gl.disableVertexAttribArray(this.vertexNormalLoc)
        if (this.settings.textured)
            gl.disableVertexAttribArray(this.vertexUvLoc)
    }

    setGlobalUniforms (data) {
        if (this.settings.transform)
            gl.uniformMatrix4fv(this.vpMatLoc, false, data.vpMatrix)
        if (this.settings.time)
            gl.uniform1f(this.timeLoc, data.time)
        if (this.settings.screenSize)
            gl.uniform2f(this.screenSizeLoc, data.width, data.height)
    }

    setMeshUniforms (mMatrix, spriteData) {
        if (this.settings.transform)
            gl.uniformMatrix4fv(this.mMatLoc, false, mMatrix)
        if (this.settings.spriteData)
            gl.uniform2fv(this.spriteDataLoc, spriteData)
    }

    setTexture (tex) {
        if (this.settings.textured) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.uniform1i(this.textureOneLoc, 0)
        }
    }

    bindMesh (mesh) {
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

    preDraw () {
        if (this.settings.cull == 0) gl.disable(gl.CULL_FACE)
        if (this.settings.cull == -1) gl.cullFace(gl.FRONT)
    }

    draw () {
        gl.drawArrays(gl.TRIANGLES, 0, this.numTris)
    }

    postDraw () {
        if (this.settings.cull == 0) gl.enable(gl.CULL_FACE)
        if (this.settings.cull == -1) gl.cullFace(gl.BACK)
    }

}

class Shader {

    constructor (vs, fs) {
        this.vsSource = vs
        this.fsSource = fs
        this.linkShader()
    }

    linkShader () {
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

    load(type, source) {
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