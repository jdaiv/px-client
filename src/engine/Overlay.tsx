import { mat4, vec3 } from 'gl-matrix'
import { IAABB } from './Interactions'
import style from './Overlay.css'

export default class Overlay {

    private width: number
    private height: number
    private widthHalf: number
    private heightHalf: number

    private base: Element
    private el: HTMLElement
    private box: HTMLElement

    public matrix: mat4
    public aabb: IAABB
    public text: string

    constructor(el: HTMLElement) {
        this.base = el
        this.el = document.createElement('div')
        this.el.className = style.overlay
        el.appendChild(this.el)

        this.box = document.createElement('div')
        this.box.className = style.box
        this.el.appendChild(this.box)

        console.log('[engine/overlay] initialised')
    }

    public destroy() {
        this.el.remove()
        console.log('[engine/overlay] destroyed')
    }

    public transformPosition(pos: vec3 | number[]) {
        let transformed = vec3.clone(pos)
        transformed = vec3.transformMat4(transformed, transformed, this.matrix)
        transformed[0] = transformed[0] * this.width * 0.5 + this.widthHalf
        transformed[1] = transformed[1] * -this.height * 0.5 + this.heightHalf
        return transformed
    }

    public run(dt: number) {
        if (this.aabb) {
            const min = this.aabb.min
            const max = this.aabb.max
            const points = [
                min,
                vec3.fromValues(min[0], min[1], max[2]),
                vec3.fromValues(min[0], max[1], min[2]),
                vec3.fromValues(max[0], min[1], min[2]),
                vec3.fromValues(min[0], max[1], max[2]),
                vec3.fromValues(max[0], max[1], min[2]),
                vec3.fromValues(max[0], min[1], max[2]),
                max,
            ]
            let minX = this.width
            let minY = this.height
            let maxX = 0
            let maxY = 0
            points.forEach(p => {
                const transformed = this.transformPosition(p)
                if (transformed[0] < minX) minX = transformed[0]
                if (transformed[1] < minY) minY = transformed[1]
                if (transformed[0] > maxX) maxX = transformed[0]
                if (transformed[1] > maxY) maxY = transformed[1]
            })

            this.box.style.opacity = '1'
            this.box.textContent = this.text
        } else {
            this.box.style.opacity = '0'
        }

        this.aabb = null
    }

}
