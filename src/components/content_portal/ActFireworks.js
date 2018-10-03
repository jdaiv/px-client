import { h, Component } from 'preact'

import style from './style'

import EventManager from '../../services/EventManager'
import Connector from '../../services/Connector'
import Services from '../../services'

class FireworksCanvas {
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

        this.missles = []
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

        // this.mirrorCtx.globalCompositeOperation = 'hard-light'
        // this.mirrorCtx.clearRect(0, 0, this.width, this.height)
        // this.mirrorCtx.drawImage(this.canvas, 0, 0)

        // this.ctx.globalAlpha = 0.01
        // this.ctx.drawImage(this.mirror, -1, -1)
        // this.ctx.drawImage(this.mirror, 1, -1)
        // this.ctx.drawImage(this.mirror, -1, 1)
        // this.ctx.drawImage(this.mirror, 1, 1)
        // this.ctx.drawImage(this.mirror, -1, 0)
        // this.ctx.drawImage(this.mirror, 0, -1)
        // this.ctx.drawImage(this.mirror, 1, 0)
        // this.ctx.drawImage(this.mirror, 0, 1)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        this.ctx.fillRect(0, 0, this.width, this.height)

        this.ctx.fillStyle = '#0f0'

        const boxSize = 2

        this.missles.forEach((m) => {
            if (!m.active) return
            m.y -= 200 * dt
            m.lifetime -= dt
            if (m.lifetime <= 0) {
                m.active = false
                for (let i = 0; i < Math.random() * 40 + 40; i++) {
                    this.addParticle(m.x, m.y, m.color)
                }
            }
            this.ctx.fillStyle = m.color
            this.ctx.fillRect(m.x, m.y, boxSize, boxSize)
        })

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

    launch (x, hue, lifetime) {
        let missle
        this.missles.forEach((m) => {
            if (!m.active) missle = m
        })
        if (!missle) {
            missle = {}
            this.missles.push(missle)
        }
        missle.x = x / 100 * this.width
        missle.y = this.height
        missle.lifetime = lifetime
        missle.color = `hsl(${hue}, ${100}%, ${50}%)`
        missle.active = true
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

export default class ActFireworks extends Component {

    launch = () => {
        Connector.send('activity', 'launch', Services.chat.activeRoom)
    }

    componentDidMount() {
        this.canvas = new FireworksCanvas(this.base)
        EventManager.subscribe('ws/activity/launch', 'fireworks', (({ action, data }) => {
            if (action.target == Services.chat.activeRoom) {
                this.canvas.launch(data.position, data.hue, data.lifetime)
            }
        }).bind(this))
    }

    shouldComponentUpdate() {
        return false
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws_message', 'fireworks')
        this.canvas.destroy()
    }

    render() {
        return (
            <div class={style.container}>
                <button onClick={this.launch} class={'button ' + style.launch}>launch!</button>
            </div>
        )
    }

}