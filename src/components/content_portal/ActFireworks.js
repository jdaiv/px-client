import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import Canvas from './Canvas'
import style from './style'

import EventManager from '../../services/EventManager'
import Services from '../../services'

@inject('rooms')
@inject('auth')
@observer
export default class ActFireworks extends Component {

    missles = []

    launch = () => {
        Services.socket.send('activity', 'launch', this.props.rooms.active)
    }

    tick = (dt) => {
        const boxSize = 3

        this.missles.forEach((m) => {
            if (!m.active) return
            m.y -= 200 * dt
            m.lifetime -= dt
            if (m.lifetime <= 0) {
                m.active = false
                for (let i = 0; i < Math.random() * 40 + 40; i++) {
                    this.canvas.addParticle(m.x, m.y, m.color)
                }
            }
            this.canvas.ctx.fillStyle = m.color
            this.canvas.ctx.fillRect(m.x - boxSize / 2, m.y - boxSize / 2, boxSize, boxSize)
        })
    }

    componentDidMount() {
        this.canvas = new Canvas(this.base)
        this.canvas.tick = this.tick
        EventManager.subscribe('ws/activity/launch', 'fireworks', (({ action, data }) => {
            if (action.target == this.props.rooms.active) {
                let missle
                this.missles.forEach((m) => {
                    if (!m.active) missle = m
                })
                if (!missle) {
                    missle = {}
                    this.missles.push(missle)
                }
                missle.x = data.position / 100 * this.canvas.width
                missle.y = this.canvas.height
                missle.lifetime = data.lifetime
                missle.color = `hsl(${data.hue}, ${100}%, ${50}%)`
                missle.active = true
            }
        }).bind(this))
    }

    shouldComponentUpdate() {
        return false
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws/activity/launch', 'fireworks')
        this.canvas.destroy()
    }

    render({ auth }) {
        return (
            <div class={style.container}>
                <button onClick={this.launch} class={'button ' + style.launch} style={{ display: auth.loggedIn ? 'block' : 'none' }}>launch!</button>
            </div>
        )
    }

}