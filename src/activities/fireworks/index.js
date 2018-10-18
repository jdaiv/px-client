import Activity from '../Activity'

const MISSLE_SIZE = 3
const WATER_HEIGHT = 100

export default class Fireworks extends Activity {

    missles = []

    launch ({ position, lifetime, hue, velocity }) {
        let missle = this.missles.find(m => !m.active)
        if (!missle) {
            missle = {}
            this.missles.push(missle)
        }
        missle.vy = 200 * velocity + 300
        missle.x = position * this.canvas.width
        missle.y = this.canvas.height - WATER_HEIGHT
        missle.lifetime = lifetime
        missle.colorStr = `hsl(${hue}, ${100}%, ${50}%)`
        missle.hue = hue
        missle.active = true
    }

    tick (dt) {
        super.tick(dt)
        this.missles.forEach(m => {
            if (!m.active) return
            m.y -= m.vy * dt
            m.vy -= 200 * dt
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
        this.missles.forEach(m => {
            if (!m.active) return
            this.ctx.fillStyle = m.colorStr
            this.ctx.fillRect(
                m.x - MISSLE_SIZE / 2, m.y - MISSLE_SIZE / 2,
                MISSLE_SIZE, MISSLE_SIZE)
        })
        this.particles.draw()

        const chunkHeight = 10
        const startY = this.canvas.height - WATER_HEIGHT

        this.ctx.fillStyle = '#002'

        for (let i = 0; i <= WATER_HEIGHT; i++) {
            this.ctx.globalAlpha = 0.5 + Math.cos(this.time / 4000 + i) * 0.2
            this.ctx.fillRect(0, startY + i, this.canvas.width, 1)
            this.ctx.drawImage(this.canvas.el,
                0, startY - i * chunkHeight, this.canvas.width, chunkHeight,
                Math.sin(this.time / 2000 + i * 20) * Math.sin(this.time / 400 + i * 0.1) + Math.cos(this.time / 5000 + i * 5),
                startY + i, this.canvas.width,
                Math.sin(this.time / 2000 + i * 0.3) * Math.sin(this.time / 1000 + i * 0.1) * 5)
        }
        this.ctx.globalAlpha = 1
    }


}