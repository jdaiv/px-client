import { gl } from './Video'

export default class GLMesh {

    public mode: number
    public verts: Float32Array
    public normals: Float32Array
    public uvs: Float32Array

    public vertBuffer: WebGLBuffer
    public normalBuffer: WebGLBuffer
    public uvsBuffer: WebGLBuffer

    constructor(rawMesh: any, mode?: number) {
        if (!mode) {
            mode = gl.STATIC_DRAW
        }
        this.mode = mode
        this.setVerts(rawMesh.verts)
        this.setUVs(rawMesh.uvs)
        if (rawMesh.normals) this.setNormals(rawMesh.normals)
    }

    public setVerts(verts: number[]) {
        this.verts = new Float32Array(verts)
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        this.vertBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.verts, this.mode)
    }

    public setNormals(normals: number[]) {
        this.normals = new Float32Array(normals)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        this.normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, this.mode)
    }

    public setUVs(uvs: number[]) {
        this.uvs = new Float32Array(uvs)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
        this.uvsBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, this.mode)
    }

    public destroy() {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
    }

}
