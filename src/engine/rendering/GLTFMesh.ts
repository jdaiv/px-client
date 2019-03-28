import { mat4, quat, vec3 } from 'gl-matrix'
import GLTFResource, { AnimationFrame } from '../resources/GLTFResource'
import { gl } from './Video'

export default class GLTFMesh {

    public raw: GLTFResource
    public mode: number
    public matrix = mat4.identity(mat4.create())
    public baseFrame: AnimationFrame

    public vertBuffer: WebGLBuffer
    public normalBuffer: WebGLBuffer
    public uvsBuffer: WebGLBuffer
    public idxBuffer: WebGLBuffer

    public numTris = 3

    constructor(gltf: GLTFResource, mode?: number) {
        if (!mode) {
            mode = gl.STATIC_DRAW
        }
        this.raw = gltf
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

    public setFrame(animationName: string, time: number) {
        if (!this.raw.animations.has(animationName)) return
        const anim = this.raw.animations.get(animationName)
        const frame = mat4.create()
        let f1Idx = -1
        let f2Idx = 9999999
        anim.forEach((f, i) => {
            if (f[0] <= time && i > f1Idx) f1Idx = i
            if (f[0] >= time && i < f2Idx) f2Idx = i
        })
        const t = vec3.create()
        const r = quat.create()
        const s = vec3.fromValues(1, 1, 1)
        if (f1Idx < 0 && f2Idx >= 9999999) {
            mat4.identity(frame)
        } else if (f2Idx >= 9999999) {
            const f = anim[f1Idx]
            vec3.copy(t, f[1])
            quat.copy(r, f[2])
            vec3.copy(s, f[3])
        } else if (f1Idx < 0) {
            const f = anim[f2Idx]
            vec3.copy(t, f[1])
            quat.copy(r, f[2])
            vec3.copy(s, f[3])
        } else {
            const f1 = anim[f1Idx]
            const f2 = anim[f2Idx]
            const dt = (time - f1[0]) / (f2[0] - f1[0])
            vec3.lerp(t, f1[1], f2[1], dt)
            quat.slerp(r, f1[2], f2[2], dt)
            vec3.lerp(s, f1[3], f2[3], dt)
        }
        mat4.fromRotationTranslationScale(frame, r, t, s)
        this.matrix = frame
    }

    public destroy() {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
    }

}
