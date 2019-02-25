import { vec3 } from 'gl-matrix'

const MESSAGE_LIFETIME = 4
const FONT_SIZE = 10
const PADDING = 3

export default class Overlay {

    constructor (el) {
        this.base = el
        this.el = document.createElement('div')
        el.appendChild(this.el)
        this.el.style.position = 'relative'

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.points = new Map()
        this.currentPoints = new Map()

        console.log('[engine/overlay] initialised')
    }

    resize () {
        console.log('[engine/overlay] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width)
            this.height = this.el.height = Math.floor(box.height)
            this.width_2 = this.width / 2
            this.height_2 = this.height / 2
            // this prevents weird half pixel scaling
            this.el.style.width = this.width + 'px'
            this.el.style.height = this.height + 'px'
        })
    }

    destroy () {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/overlay] destroyed')
    }

    add (id, position, text, callback) {
        this.points.set(id, { position, text, callback })
    }

    remove (id) {
        this.el.removeChild(this.currentPoints.get(id).el)
        this.currentPoints.delete(id)
    }

    createElement () {
        const el = document.createElement('div')
        el.style.color = 'white'
        el.style.position = 'absolute'
        this.el.appendChild(el)
        return el
    }

    createTitle (el) {
        const p = document.createElement('p')
        el.appendChild(p)
        return p
    }

    createButton (el, callback) {
        const btn = document.createElement('button')
        btn.textContent = 'use'
        btn.onclick = callback
        el.appendChild(btn)
        return btn
    }

    run (t) {

        [...this.currentPoints.keys()].filter(
            (p, id) => this.points.has(id)
        ).forEach(id => this.remove(id))

        this.points.forEach((p, id) => {
            if (this.currentPoints.has(id)) {
                let cP = this.currentPoints.get(id)
                if (cP.text != p.text) {
                    cP.text = p.text
                    cP.dirty = true
                }
                cP.position = p.position
                return
            }
            const el = this.createElement()
            this.currentPoints.set(id, {
                ...p,
                dirty: true,
                el,
                title: this.createTitle(el)
            })
            if (typeof p.callback === 'function') this.createButton(el, p.callback)
        })

        this.currentPoints.forEach((p, id) => {
            if (p.dirty) {
                p.title.textContent = p.text
                p.dirty = false
            }
            let _pos = vec3.copy(vec3.create(), p.position)
            _pos = vec3.transformMat4(_pos, _pos, this.matrix)
            _pos[0] = _pos[0] * this.width * 0.5 + this.width_2
            _pos[1] = _pos[1] * -this.height * 0.5 + this.height_2
            p.el.style.left = _pos[0] + 'px'
            p.el.style.top = _pos[1] + 'px'
        })

    }

}