const GRAVITY = 40

export default class ParticleSystem {

    constructor (canvas) {
        this.canvas = canvas
        this.ctx = this.canvas.ctx
        this.particles = []
        this.particleSize = 2
        this.gravity = GRAVITY
    }

    tick (dt) {
        this.particles.forEach((p) => {
            if (!p.active) return
            p.x += dt * p.vx
            p.y += dt * p.vy
            p.vy += this.gravity * dt * p.weight
            p.lifetime -= dt
            if (p.lifetime <= 0) {
                p.active = false
            }
        })
    }

    draw (dt) {
        this.particles.forEach((p) => {
            if (!p.active) return
            this.ctx.fillStyle = p.color
            this.ctx.fillRect(p.x, p.y,
                this.particleSize, this.particleSize)
        })
    }

    add (x, y, color) {
        let particle = this.particles.find(p => !p.active)
        if (!particle) {
            particle = {}
            this.particles.push(particle)
        }
        particle.x = x
        particle.y = y

        const vx = Math.random() - 0.5
        const vy = Math.random() - 0.5
        const length = Math.sqrt(vx * vx + vy * vy)

        particle.vx = (vx / length) * (Math.random() * 100)
        particle.vy = (vy / length) * (Math.random() * 100)
        particle.lifetime = Math.random() * 1 + 1.5
        particle.color = color
        particle.weight = 1
        particle.active = true
    }

    add2 (x, y, vx, vy, lifetime, color, weight = 1) {
        let particle = this.particles.find(p => !p.active)
        if (!particle) {
            particle = {}
            this.particles.push(particle)
        }
        particle.x = x
        particle.y = y
        particle.vx = vx
        particle.vy = vy
        particle.lifetime = lifetime
        particle.color = color
        particle.weight = weight
        particle.active = true
    }

}