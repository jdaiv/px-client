import { vec3 } from 'gl-matrix'
import Engine from '../Engine'
import FoliageEmitter from './foliage/FoliageEmitter'
import FoliageRenderMaterial from './foliage/Materials'
import fs from './shaders/foliage.fs'
import vs from './shaders/foliage.vs'
import { gl } from './Video'

const MAX_POINTS = 100000

export default class Foliage {

    private engine: Engine

    private material: FoliageRenderMaterial

    private dataArr: Float32Array
    private usedIndices: boolean[]
    private dataBuff: WebGLBuffer

    constructor(engine: Engine) {
        this.engine = engine

        this.material = new FoliageRenderMaterial(vs, fs)
        this.dataArr = new Float32Array(MAX_POINTS * 11)
        this.setBuffers()

        this.usedIndices = []
        for (let i = 0; i < MAX_POINTS; i++) {
            this.usedIndices[i] = false
        }
    }

    public getEmitter(): FoliageEmitter {
        return new FoliageEmitter(this)
    }

    public getIdx(): number {
        for (let i = 0; i < MAX_POINTS; i++) {
            if (!this.usedIndices[i]) {
                this.usedIndices[i] = true
                return i
            }
        }
        return -1
    }

    public setIdx(idx: number, base: vec3, start: vec3, end: vec3, color: number[], size: number) {
        const offset = idx * 11
        this.dataArr[offset + 0] = start[0] + base[0]
        this.dataArr[offset + 1] = start[1] + base[1]
        this.dataArr[offset + 2] = start[2] + base[2]
        this.dataArr[offset + 3] = end[0] + base[0]
        this.dataArr[offset + 4] = end[1] + base[1]
        this.dataArr[offset + 5] = end[2] + base[2]
        this.dataArr[offset + 6] = color[0] / 255
        this.dataArr[offset + 7] = color[1] / 255
        this.dataArr[offset + 8] = color[2] / 255
        this.dataArr[offset + 9] = color[3]
        this.dataArr[offset + 10] = size
    }

    public freeIdx(idx: number) {
        this.usedIndices[idx] = false
    }

    private setBuffers() {
        this.dataBuff = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.dataBuff)
        gl.bufferData(gl.ARRAY_BUFFER, this.dataArr, gl.DYNAMIC_DRAW)
    }

    public draw(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data.vpMatrix, data.time)
        m.bindMesh(this.engine.resources.models.get('terrain').mesh)
        m.bindData(this.dataBuff, this.dataArr)
        m.draw(MAX_POINTS)
        m.end()
    }

}
