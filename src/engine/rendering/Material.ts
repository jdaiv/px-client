import Shader from './Shader';
import { gl } from './Video';

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
