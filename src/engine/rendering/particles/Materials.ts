import { mat4 } from 'gl-matrix'
import GLMesh from '../GLMesh'
import Shader from '../Shader'
import { gl } from '../Video'

export class ParticleCreateMaterial {

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

export class ParticleThinkMaterial {

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

export class ParticleDrawMaterial {

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
