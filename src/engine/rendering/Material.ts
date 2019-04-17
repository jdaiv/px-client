import { mat4, vec2, vec4 } from 'gl-matrix'
import GLMesh from './GLMesh'
import GLTFMesh from './GLTFMesh'
import Shader from './Shader'
import { gl } from './Video'

export default class Material {

    private shader: Shader

    public settings: any

    private vertexPosLoc: number
    private vertexNormalLoc: number
    private vertexUvLoc: number
    private numTris: number

    private vpMatLoc: WebGLUniformLocation
    private mMatLoc: WebGLUniformLocation
    private textureOneLoc: WebGLUniformLocation
    private textureTwoLoc: WebGLUniformLocation
    private spriteDataLoc: WebGLUniformLocation
    private colorLoc: WebGLUniformLocation
    private timeLoc: WebGLUniformLocation

    private boundMeshIsGLTF = false
    private vao: WebGLVertexArrayObject

    constructor(settings: any) {
        this.settings = settings
        this.shader = new Shader(settings.vs, settings.fs)
        const prog = this.shader.program

        this.vao = gl.createVertexArray()

        this.vertexPosLoc = gl.getAttribLocation(prog, 'aVertexPosition')
        this.vertexNormalLoc = gl.getAttribLocation(prog, 'aVertexNormal')
        this.vpMatLoc = gl.getUniformLocation(prog, 'uVP_Matrix')
        this.mMatLoc = gl.getUniformLocation(prog, 'uM_Matrix')
        this.vertexUvLoc = gl.getAttribLocation(prog, 'aTextureCoord')
        this.textureOneLoc = gl.getUniformLocation(prog, 'uSampler')
        this.textureTwoLoc = gl.getUniformLocation(prog, 'uSamplerTwo')
        this.spriteDataLoc = gl.getUniformLocation(prog, 'uSpriteData')
        this.colorLoc = gl.getUniformLocation(prog, 'uColor')
        this.timeLoc = gl.getUniformLocation(prog, 'uTime')

    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        if (this.vertexPosLoc >= 0) gl.disableVertexAttribArray(this.vertexPosLoc)
        if (this.vertexNormalLoc >= 0) gl.disableVertexAttribArray(this.vertexNormalLoc)
        if (this.vertexUvLoc >= 0) gl.disableVertexAttribArray(this.vertexUvLoc)
        gl.bindVertexArray(null)
    }

    public setGlobalUniforms(data: any) {
        if (this.vpMatLoc != null) gl.uniformMatrix4fv(this.vpMatLoc, false, data.vpMatrix)
        if (this.timeLoc != null) gl.uniform1f(this.timeLoc, data.time)
    }

    public setMeshUniforms(mMatrix: mat4, spriteData?: vec2, color?: vec4) {
        if (this.mMatLoc != null) gl.uniformMatrix4fv(this.mMatLoc, false, mMatrix)
        if (this.spriteDataLoc != null) gl.uniform2fv(this.spriteDataLoc, spriteData)
        if (this.colorLoc != null) gl.uniform4fv(this.colorLoc, color)
    }

    public setTexture(tex: WebGLTexture) {
        if (this.textureOneLoc != null) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.uniform1i(this.textureOneLoc, 0)
        }
    }

    public setTextureTwo(tex: WebGLTexture) {
        if (this.textureTwoLoc != null) {
            gl.activeTexture(gl.TEXTURE1)
            gl.bindTexture(gl.TEXTURE_2D, tex)
            gl.uniform1i(this.textureTwoLoc, 1)
        }
    }

    public bindMesh(mesh: GLMesh | GLTFMesh, numTris?: number) {
        gl.bindVertexArray(this.vao)
        if (this.vertexPosLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertBuffer)
            gl.enableVertexAttribArray(this.vertexPosLoc)
            gl.vertexAttribPointer(this.vertexPosLoc, 3, gl.FLOAT, false, 0, 0)
        }
        if (this.vertexNormalLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer)
            gl.enableVertexAttribArray(this.vertexNormalLoc)
            gl.vertexAttribPointer(this.vertexNormalLoc, 3, gl.FLOAT, true, 0, 0)
        }
        if (this.vertexUvLoc >= 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvsBuffer)
            gl.enableVertexAttribArray(this.vertexUvLoc)
            gl.vertexAttribPointer(this.vertexUvLoc, 2, gl.FLOAT, false, 0, 0)
        }
        this.boundMeshIsGLTF = mesh instanceof GLTFMesh
        if (this.boundMeshIsGLTF) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, (mesh as GLTFMesh).idxBuffer)
        }
        this.numTris = numTris !== undefined ? numTris : (mesh.numTris)
    }

    public preDraw() {
        if (this.settings.cull === 0) gl.disable(gl.CULL_FACE)
        if (this.settings.cull === -1) gl.cullFace(gl.FRONT)
    }

    public draw() {
        if (this.numTris > 0) {
            if (this.boundMeshIsGLTF) {
                gl.drawElements(gl.TRIANGLES, this.numTris, gl.UNSIGNED_SHORT, 0)
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, this.numTris)
            }
        }
    }

    public postDraw() {
        if (this.settings.cull === 0) gl.enable(gl.CULL_FACE)
        if (this.settings.cull === -1) gl.cullFace(gl.BACK)
    }

}
