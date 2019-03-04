import { vec3 } from 'gl-matrix'

import './overlayStyle'

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

    add (id, position, text, callback, btnText) {
        if (!this.points.has(id)) {
            this.points.set(id, { position: vec3.clone(position), text, callback, btnText, usable: typeof callback === 'function' })
        } else {
            const p = this.points.get(id)
            vec3.copy(p.position, position)
            p.text = text
            p.callback = callback
            p.btnText = btnText
            p.usable = typeof callback === 'function'
            p.active = true
        }
    }

    addDamage (position, amt, effect) {
        const _p = position.join(',')
        if (!this.damagePoints.has(_p)) this.damagePoints.set(_p, [])
        this.damagePoints.get(_p).push({ amt, effect, timer: 0 })
    }

    remove (id) {
        this.el.removeChild(this.currentPoints.get(id).container)
        this.currentPoints.delete(id)
    }

    createElement () {
        const container = document.createElement('div')
        container.className = 'point'
        this.el.appendChild(container)
        return container
    }

    createTitle (el) {
        const p = document.createElement('p')
        el.appendChild(p)
        return p
    }

    createButton (el, callback) {
        const btn = document.createElement('button')
        btn.className = 'useBtn'
        btn.onclick = callback
        el.appendChild(btn)
        return btn
    }

    prunePoints () {
        Array.from(this.currentPoints.keys()).filter(
            (id) => !this.points.has(id)
        ).forEach(id => this.remove(id))
    }

    createNewPoints () {
        this.points.forEach((p, id) => {
            if (this.currentPoints.has(id)) {
                let cP = this.currentPoints.get(id)
                if (cP.text != p.text) {
                    cP.text = p.text
                    cP.dirty = true
                }
                if (cP.btnText != p.btnText) {
                    cP.btnText = p.btnText
                    cP.dirty = true
                }
                cP.container.style.display = p.active ? 'block' : 'none'
                cP.position = p.position
                p.active = false
                return
            }
            const container = this.createElement()
            let inner
            if (p.usable)
                inner = this.createButton(container, p.callback)
            else
                inner = this.createTitle(container)
            this.currentPoints.set(id, {
                ...p,
                dirty: true,
                container,
                inner
            })
            p.active = false
        })
    }

    updatePointPositions (points, dt) {
        points.forEach(p => {
            let _pos = vec3.copy(vec3.create(), p.position)
            _pos = vec3.transformMat4(_pos, _pos, this.matrix)
            _pos[0] = _pos[0] * this.width * 0.5 + this.width_2
            _pos[1] = _pos[1] * -this.height * 0.5 + this.height_2
            p.target = _pos
            p.container.style.zIndex = Math.floor(p.position[1])
        })

        points.forEach(p => {
            const rect = p.container.getBoundingClientRect()

            p.rect = rect
            p.target[0] -= rect.width / 2
            p.target[1] -= rect.height / 2

            if (!p.actual) p.actual = vec3.clone(p.target)
        })

        points.forEach(p => {
            vec3.lerp(p.actual, p.actual, p.target, dt * 20)
            p.container.style.left = p.actual[0] + 'px'
            p.container.style.top = p.actual[1] + 'px'
        })
    }

    run (dt) {
        // this.prunePoints()
        this.createNewPoints()
        this.currentPoints.forEach(p => {
            if (p.dirty) {
                p.inner.innerHTML = p.usable ? `<em>${p.btnText}</em> ${p.text}` : p.text
                p.dirty = false
            }
        })
        this.updatePointPositions(this.currentPoints, dt)
    }

}