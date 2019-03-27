import { mat4, quat, vec3 } from 'gl-matrix'
import GLTFMesh from '../rendering/GLTFMesh'

export const GLTF_BYTE = 5120
export const GLTF_UNSIGNED_BYTE = 5121
export const GLTF_SHORT = 5122
export const GLTF_UNSIGNED_SHORT = 5123
export const GLTF_UNSIGNED_INT = 5125
export const GLTF_FLOAT = 5126

export class GLTFBuffer {

    public type: string
    public format: number
    public buffer: ArrayBuffer
    public length: number

    constructor(raw: string, accessor: any, view: any) {
        this.type = accessor.type
        this.format = accessor.componentType
        this.length = accessor.count
        this.buffer = new ArrayBuffer(view.byteLength)
        const dv = new DataView(this.buffer)
        for (let i = 0; i < view.byteLength; i++) {
            dv.setUint8(i, raw.charCodeAt(view.byteOffset + i))
        }
    }

}

export default class GLTFResource {

    public src: any
    public mesh: GLTFMesh
    public buffers: GLTFBuffer[]
    public primitives: any

    constructor(src: any) {
        console.log(src)
        this.src = src

        const byteStrs = this.src.buffers.map(b => atob(b.uri.split(',')[1]))
        this.buffers = this.src.accessors.map((a, i) => {
            const view = this.src.bufferViews[a.bufferView]
            return new GLTFBuffer(byteStrs[view.buffer], a, view)
        })

        this.primitives = this.src.meshes[0].primitives[0]

        // scale model
        const verts = new Float32Array(this.buffers[this.primitives.attributes.POSITION].buffer)
        verts.forEach((v, i) => {
            verts[i] = v * 8
        })

        this.mesh = new GLTFMesh(this)

        // build matrix
        const m = this.mesh.matrix
        this.src.nodes.forEach(n => {
            if (n.mesh !== 0) return

            if (n.scale) mat4.scale(m, m, n.scale)
            if (n.rotation) mat4.multiply(m, m, mat4.fromQuat(mat4.create(), n.rotation))
            if (n.translation) mat4.translate(m, m, vec3.scale(vec3.create(), n.translation, 8))
        })
    }

    public static async load(src: string): Promise<GLTFResource> {
        return new GLTFResource(src)
    }

}
