import { mat4 } from 'gl-matrix'
import GLMesh from '../GLMesh'
import GLTFMesh from '../GLTFMesh'
import Shader from '../Shader'
import { gl } from '../Video'

export default class FoliageRenderMaterial {

    private shader: Shader

    private startLoc: number
    private endLoc: number
    private sizeLoc: number
    private colorLoc: number
    private vpMatLoc: WebGLUniformLocation
    private timeLoc: WebGLUniformLocation

    private vertexPosLoc: number
    private vertexNormalLoc: number
    private vertexUvLoc: number

    private numTris = 0
    private boundMeshIsGLTF = false
    private vao: WebGLVertexArrayObject

    constructor(vs: string, fs: string) {
        this.shader = new Shader(vs, fs)
        const prog = this.shader.program

        this.vertexPosLoc = gl.getAttribLocation(prog, 'aVertexPosition')
        this.vertexNormalLoc = gl.getAttribLocation(prog, 'aVertexNormal')
        this.vertexUvLoc = gl.getAttribLocation(prog, 'aTextureCoord')

        this.startLoc = gl.getAttribLocation(prog, 'aStart')
        this.endLoc = gl.getAttribLocation(prog, 'aEnd')
        this.sizeLoc = gl.getAttribLocation(prog, 'aSize')
        this.colorLoc = gl.getAttribLocation(prog, 'aColor')
        this.vpMatLoc = gl.getUniformLocation(prog, 'uVP_Matrix')
        this.timeLoc = gl.getUniformLocation(prog, 'uTime')
    }

    public use() {
        gl.useProgram(this.shader.program)
    }

    public end() {
        gl.disableVertexAttribArray(this.startLoc)
        gl.disableVertexAttribArray(this.endLoc)
        gl.disableVertexAttribArray(this.sizeLoc)
        gl.disableVertexAttribArray(this.colorLoc)
    }

    public setGlobalUniforms(matrix: mat4, time: number) {
        gl.uniformMatrix4fv(this.vpMatLoc, false, matrix)
        gl.uniform1f(this.timeLoc, time)
    }

    public bindData(buf: WebGLBuffer, data: Float32Array) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)
        gl.enableVertexAttribArray(this.startLoc)
        gl.enableVertexAttribArray(this.endLoc)
        gl.enableVertexAttribArray(this.sizeLoc)
        gl.enableVertexAttribArray(this.colorLoc)
        gl.vertexAttribPointer(this.startLoc, 3, gl.FLOAT, false, 4 * 11, 0)
        gl.vertexAttribDivisor(this.startLoc, 1)
        gl.vertexAttribPointer(this.endLoc, 3, gl.FLOAT, false, 4 * 11, 4 * 3)
        gl.vertexAttribDivisor(this.endLoc, 1)
        gl.vertexAttribPointer(this.colorLoc, 4, gl.FLOAT, false, 4 * 11, 4 * 6)
        gl.vertexAttribDivisor(this.colorLoc, 1)
        gl.vertexAttribPointer(this.sizeLoc, 1, gl.FLOAT, false, 4 * 11, 4 * 10)
        gl.vertexAttribDivisor(this.sizeLoc, 1)
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

    public draw(num: number) {
        if (this.boundMeshIsGLTF) {
            gl.drawElementsInstanced(gl.TRIANGLES, this.numTris, gl.UNSIGNED_SHORT, 0, num)
        } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, this.numTris, num)
        }
    }

}
