import Video from './Video'
import MaterialManager from './MaterialManager'
import Resources from './Resources'
import Station from './stages/Station'
import { Vector2 } from './Vector'

import Services from '../services'
import EventManager from '../services/EventManager'

export default class Engine {

    camera = { offset: new Vector2(), zoom: 1 }
    players = {}
    me = null

    constructor (el) {
        console.log('[engine] starting...')
        this.v = new Video(el)
        Resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            MaterialManager.load()
            this.activeStage = new Station(this)

            EventManager.subscribe('ws/chat/update_room', 'engine', (({ action, data }) => {
                const players = data.state.players
                for (let key in players) {
                    if (Services.auth.store.usernameN == key) continue
                    this.players[key] = players[key]
                }
                for (let key in this.players) {
                    if (!players[key]) {
                        this.players[key] = null
                    }
                }
            }).bind(this))

            this.start()
        })
    }

    start () {
        this.time = -1
        this.raf = window.requestAnimationFrame(this.loop)
    }

    stop () {
        window.cancelAnimationFrame(this.raf)
    }

    destroy () {
        console.log('[engine] destroy called')
        this.v.destroy()
        window.cancelAnimationFrame(this.raf)
    }

    loop = (t) => {
        this.raf = window.requestAnimationFrame(this.loop)

        if (this.time < 0) {
            this.time = t
            console.log('[engine] starting loop')
            return
        }

        this.dt = (t - this.time) / 1000
        this.time = t

        if (this.activeStage) {
            this.activeStage.tick(this.dt)

            if (this.me != null && this.sendUpdate) {
                Services.socket.send('chat', 'player_move', Services.rooms.store.active, this.me)
                this.sendUpdate = false
            }

            this.v.clear()
            this.activeStage.draw(this.dt)
            this.v.run(this.time)
            this.activeStage.lateTick(this.dt)
        }
    }

}