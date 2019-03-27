import { mat4 } from 'gl-matrix'
import GLTFResource from '../resources/GLTFResource'
import { gl } from './Video'

export default class GLTFMesh {

    public mode: number
    public matrix = mat4.identity(mat4.create())

    public vertBuffer: WebGLBuffer
    public normalBuffer: WebGLBuffer
    public uvsBuffer: WebGLBuffer
    public idxBuffer: WebGLBuffer

    public numTris = 3

    constructor(gltf: GLTFResource, mode?: number) {
        if (!mode) {
            mode = gl.STATIC_DRAW
        }
        this.mode = mode
        this.setVerts(gltf.buffers[gltf.primitives.attributes.POSITION].buffer)
        if (gltf.buffers[gltf.primitives.attributes.TEXCOORD_0])
            this.setUVs(gltf.buffers[gltf.primitives.attributes.TEXCOORD_0].buffer)
        if (gltf.buffers[gltf.primitives.attributes.NORMAL])
            this.setNormals(gltf.buffers[gltf.primitives.attributes.NORMAL].buffer)
        this.setIndices(gltf.buffers[gltf.primitives.indices].buffer)
        this.numTris = gltf.buffers[gltf.primitives.indices].length
    }

    public setVerts(verts: ArrayBuffer) {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        this.vertBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, verts, this.mode)
    }

    public setNormals(normals: ArrayBuffer) {
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        this.normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, normals, this.mode)
    }

    public setUVs(uvs: ArrayBuffer) {
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
        this.uvsBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, uvs, this.mode)
    }

    public setIndices(indices: ArrayBuffer) {
        if (this.idxBuffer) gl.deleteBuffer(this.idxBuffer)
        this.idxBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, this.mode)
    }

    public destroy() {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
    }

}
