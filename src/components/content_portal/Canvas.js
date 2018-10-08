export default class Canvas {
    constructor (el) {
        this.canvas = document.createElement('canvas')
        this.mirror = document.createElement('canvas')
        el.appendChild(this.canvas)

        setTimeout(() => {
            const box = el.getBoundingClientRect()
            this.width = this.mirror.width = this.canvas.width = Math.floor(box.width)
            this.height = this.mirror.height = this.canvas.height = Math.floor(box.height)
        }, 100)

        this.ctx = this.canvas.getContext('2d')
        this.mirrorCtx = this.mirror.getContext('2d')
        this.time = -1
        this.raf = window.requestAnimationFrame(this.loop)

        this.particles = []
    }

    loop = (t) => {
        this.raf = window.requestAnimationFrame(this.loop)
        if (this.time < 0) {
            this.time = t
            return
        }

        const dt = (t - this.time) / 1000
        this.time = t

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        this.ctx.fillRect(0, 0, this.width, this.height)

        if (this.tick) this.tick(dt)

        const boxSize = 2

        this.particles.forEach((p) => {
            if (!p.active) return
            p.x += dt * p.vx
            p.y += dt * p.vy
            p.vy += 40 * dt
            p.lifetime -= dt
            if (p.lifetime <= 0) {
                p.active = false
            }

            this.ctx.fillStyle = p.color
            this.ctx.fillRect(p.x, p.y, boxSize, boxSize)
        })


    }

    addParticle (x, y, color) {
        let particle
        this.particles.forEach((p) => {
            if (!p.active) particle = p
        })
        if (!particle) {
            particle = {}
            this.particles.push(particle)
        }
        particle.x = x
        particle.y = y
        particle.vx = Math.random() * 100 - 50
        particle.vy = Math.random() * 100 - 80
        particle.lifetime = Math.random() * 1 + 1.5
        particle.color = color
        particle.active = true
    }

    destroy () {
        window.cancelAnimationFrame(this.raf)
    }
}