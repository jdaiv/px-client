import Canvas from './Canvas'
import ParticleSystem from './ParticleSystem'

export default class Activity {

    constructor (el) {
        this.name = 'unnamed'
        this.canvas = new Canvas(el)
        this.ctx = this.canvas.ctx
        this.particles = new ParticleSystem(this.canvas)

        this.time = -1
        this.raf = null
    }

    start () {
        this.raf = window.requestAnimationFrame(this.loop)
    }

    stop () {
        window.cancelAnimationFrame(this.raf)
    }

    loop = (t) => {
        this.raf = window.requestAnimationFrame(this.loop)

        if (this.time < 0) {
            this.time = t
            return
        }

        this.dt = (t - this.time) / 1000
        this.time = t

        this.tick(this.dt)
        this.draw()
    }

    tick (dt) {
        this.particles.tick(dt)
    }

    draw () {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

}