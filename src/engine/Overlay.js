import { vec3 } from 'gl-matrix'

const MESSAGE_LIFETIME = 4
const FONT_SIZE = 10
const PADDING = 3

class OverlayMessage {
    constructor (content, offset) {
        this.content = 0
        this.yOffset = offset
        this.timer = MESSAGE_LIFETIME
    }
}

class OverlayPoint {

    title = ''
    titleOffset = vec3.create()
    messages = []
    messageOffset = vec3.create()

    constructor (owner) {
        this.owner = owner
    }

    addMessage (content) {
        this.messages.unshift(new OverlayMessage(content, 0))
    }

    render (ctx) {
        ctx.save()

        ctx.translate(
            Math.round(this.owner.position[0] + this.owner.position[2]) * 2,
            Math.round(-this.owner.position[1] + this.owner.position[2]) * 2
        )

        if (this.title) {
            ctx.save()
            ctx.translate(this.titleOffset[0], this.titleOffset[1])
            const { width } = ctx.measureText(this.title)
            const width2 = Math.ceil(width / 2 + PADDING)
            const height2 = Math.ceil(FONT_SIZE / 2 + PADDING)
            ctx.fillStyle = '#000a'
            ctx.fillRect(-width2, -height2, width + PADDING * 2, FONT_SIZE + PADDING * 2 + 2)
            ctx.strokeRect(-width2, -height2, width + PADDING * 2, FONT_SIZE + PADDING * 2 + 2)
            ctx.fillStyle = '#0f0'
            ctx.fillText(this.title, 0, 0)
            ctx.restore()
        }

        ctx.restore()
    }

}

export default class Overlay {

    constructor (el) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        this.ctx = this.el.getContext('2d')

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.points = new Map()

        console.log('[engine/overlay] initialised')

    }

    resize () {
        console.log('[engine/overlay] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width)
            this.height = this.el.height = Math.floor(box.height)
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

    clear () {
        this.ctx.clearRect(0, 0, this.width, this.height)
    }

    addPoint (ent) {
        const p = new OverlayPoint(ent)
        this.points.set(ent, p)
        return p
    }

    removePoint (ent) {
        this.points.remove(ent)
    }

    run (t) {
        this.clear()

        this.ctx.strokeStyle = '#0f0'
        this.ctx.fillStyle = '#000'
        this.ctx.font = `${FONT_SIZE}px monospace`
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'

        this.ctx.save()
        this.ctx.translate(this.width / 2, this.height / 2)

        this.points.forEach((p, ent) => {
            if (!ent) return
            p.render(this.ctx)
        })

        this.ctx.restore()
    }

}