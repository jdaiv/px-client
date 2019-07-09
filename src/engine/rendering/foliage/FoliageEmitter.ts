import { vec3 } from 'gl-matrix'
import Foliage from '../Foliage'

const ZERO = vec3.fromValues(0, 0, 0)

export default class FoliageEmitter {

    public parent: Foliage
    public base = ZERO

    private indices: Map<number, boolean>

    constructor(parent: Foliage) {
        this.parent = parent
        this.indices = new Map()
    }

    public add(start: vec3, end: vec3, color: number[], size: number) {
        const newIdx = this.parent.getIdx()
        if (newIdx < 0) {
            return
        }
        this.indices.set(newIdx, true)
        this.parent.setIdx(newIdx, this.base, start, end, color, size)
    }

    public destroy() {
        this.indices.forEach((_, idx) => this.parent.freeIdx(idx))
    }

}
