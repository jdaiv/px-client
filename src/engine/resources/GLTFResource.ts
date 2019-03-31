import { mat4, quat, vec3 } from 'gl-matrix'
import GLTFMesh from '../rendering/GLTFMesh'

export const GLTF_BYTE = 5120
export const GLTF_UNSIGNED_BYTE = 5121
export const GLTF_SHORT = 5122
export const GLTF_UNSIGNED_SHORT = 5123
export const GLTF_UNSIGNED_INT = 5125
export const GLTF_FLOAT = 5126

const GLTF_TYPES = {
    5120: 'BYTE',
    5121: 'UNSIGNED_BYTE',
    5122: 'SHORT',
    5123: 'UNSIGNED_SHORT',
    5125: 'UNSIGNED_INT',
    5126: 'FLOAT'
}

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

    public toString(): string {
        return `GLTF Buffer ${this.type}<${GLTF_TYPES[this.format]}>[${this.length}]`
    }

}

export interface IAnimationFrame {
    time: number
    // in: [vec3, quat, vec3]
    point: [vec3, quat, vec3]
    // out: [vec3, quat, vec3]
}
type AnimationFrames = IAnimationFrame[]

export default class GLTFResource {

    public src: any
    public mesh: GLTFMesh
    public buffers: GLTFBuffer[]
    public primitives: any
    public animations: Map<string, AnimationFrames>

    constructor(src: any) {
        this.src = src

        const byteStrs = this.src.buffers.map(b => atob(b.uri.split(',')[1]))
        this.buffers = this.src.accessors.map(a => {
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
            if (n.translation) {
                mat4.translate(m, m, vec3.scale(vec3.create(), n.translation, 8))
            }
            if (n.rotation) {
                mat4.multiply(m, m, mat4.fromQuat(mat4.create(), n.rotation))
            }
            if (n.scale) {
                mat4.scale(m, m, n.scale)
            }
        })

        this.animations = new Map()
        if (this.src.animations) {
            this.src.animations.forEach(a => {
                // safe to assume we have a single input, i.e. frames
                // at least for my extremely simple purposes, since I'm using
                // sampled animations
                const inBuf = new Float32Array(this.buffers[a.samplers[0].input].buffer)
                const outBufs = new Array<Float32Array>()
                const has = {
                    t: -1, r: -1, s: -1
                }
                a.channels.forEach((c, i) => {
                    if (c.target.node !== 0) return
                    switch (c.target.path) {
                        case 'translation': has.t = i; break
                        case 'rotation': has.r = i; break
                        case 'scale': has.s = i; break
                        default: return
                    }
                    const s = a.samplers[c.sampler]
                    outBufs[i] = new Float32Array(this.buffers[s.output].buffer)
                })
                console.log(outBufs)
                const animation = new Array<IAnimationFrame>()
                inBuf.forEach((time, idx) => {
                    const frame: IAnimationFrame = {
                        time,
                        point: [vec3.create(), quat.create(), vec3.fromValues(1, 1, 1)]
                    }
                    const s = frame.point[2]
                    const r = frame.point[1]
                    const t = frame.point[0]
                    if (has.s >= 0) {
                        const buf = outBufs[has.s]
                        const o = (idx) * 3
                        vec3.set(s, buf[o], buf[o + 1], buf[o + 2])
                    }
                    if (has.r >= 0) {
                        const buf = outBufs[has.r]
                        const o = (idx) * 4
                        quat.set(r, buf[o], buf[o + 1], buf[o + 2], buf[o + 3])
                    }
                    if (has.t >= 0) {
                        const buf = outBufs[has.t]
                        const o = (idx) * 3
                        vec3.set(t, buf[o], buf[o + 1], buf[o + 2])
                        vec3.scale(t, t, 8)
                    }
                    animation.push(frame)
                })
                this.animations.set(a.name, animation)
            })
        }
    }

    public static async load(src: string): Promise<GLTFResource> {
        return new GLTFResource(src)
    }

}
