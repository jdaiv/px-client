import Activity from '../Activity'

const MISSLE_SIZE = 3

export default class Fireworks extends Activity {

    missles = []

    launch ({ position, lifetime, hue }) {
        let missle
        this.missles.forEach((m) => {
            if (!m.active) missle = m
        })
        if (!missle) {
            missle = {}
            this.missles.push(missle)
        }
        missle.x = position / 100 * this.canvas.width
        missle.y = this.canvas.height
        missle.lifetime = lifetime
        missle.colorStr = `hsl(${hue}, ${100}%, ${50}%)`
        missle.hue = hue
        missle.active = true
    }

    tick (dt) {
        super.tick(dt)
        this.missles.forEach((m) => {
            if (!m.active) return
            m.y -= 200 * dt
            m.lifetime -= dt
            if (m.lifetime <= 0) {
                m.active = false
                for (let i = 0; i < 50; i++) {
                    this.particles.add(m.x, m.y,
                        `hsl(${(m.hue + Math.random() * 40 - 20) % 360}, ${100}%, ${50}%)`)
                }
            }
        })
    }

    draw (dt) {
        super.draw()
        this.missles.forEach((m) => {
            if (!m.active) return
            this.ctx.fillStyle = m.colorStr
            this.ctx.fillRect(
                m.x - MISSLE_SIZE / 2, m.y - MISSLE_SIZE / 2,
                MISSLE_SIZE, MISSLE_SIZE)
        })
        this.particles.draw()
    }


}