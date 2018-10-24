import Physics from './Physics'
import Video from './Video'
import Overlay from './Overlay'
import Synth from './audio/Synth'
import MaterialManager from './MaterialManager'
import Resources from './Resources'
import Station from './stages/Station'
import { Vector2 } from './Vector'

import Player from './entities/Player'
import FireworkLauncher from './entities/FireworkLauncher'
import Firework from './entities/Firework'

import Services from '../services'
import EventManager from '../services/EventManager'

export default class Engine {

    camera = { offset: new Vector2(), zoom: 1 }
    players = {}
    me = null

    constructor (el) {
        console.log('[engine] starting...')
        this.v = new Video(el)
        this.overlay = new Overlay(el)
        this.synth = new Synth()
        Resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            MaterialManager.load()
            this.activeStage = new Station(this)

            EventManager.subscribe('ws/room/update', 'engine',
                (({ action, data }) => {
                    if (!this.activeStage) return

                    const nE = this.activeStage.networkedEntities

                    for (let key in data) {
                        const eData = data[key]
                        let ent = nE.get(key)
                        if (ent === undefined) {

                            switch (eData.type) {
                            case 'player':
                                ent = new Player(this, 'p_' + eData.id,
                                    eData.id, eData.owner)
                                break
                            case 'firework_launcher':
                                ent = new FireworkLauncher(this, 'fl_' + eData.id,
                                    eData.id)
                                break
                            case 'firework':
                                ent = new Firework(this, 'f_' + eData.id,
                                    eData.id)
                                break
                            }

                            if (!ent) continue

                            this.activeStage.addNetworkedEntity(ent)
                        }
                        if (eData) {
                            ent.networkRecv(eData)
                        }
                    }

                    nE.forEach((e, id) => {
                        if (!data.hasOwnProperty(id)) {
                            e.destroy()
                        }
                    })
                }).bind(this))

            this.start()
        })

        this.phys = new Physics(1)
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
            this.activeStage.lateTick(this.dt)
            this.activeStage.draw(this.dt)
            this.v.run(this.time)
            this.overlay.run()
            this.synth.tick(this.dt)

            let toSend = {}
            let hasUpdate = false
            this.activeStage.networkedEntities.forEach((e, id) => {
                if (e.networked && e.isAuthority) {
                    let data = e.networkSend()
                    if (data && data.length > 0) {
                        toSend[id] = data
                        hasUpdate = true
                    }
                }
            })

            if (hasUpdate) {
                Services.socket.send('room', 'update',
                    Services.rooms.store.active, toSend)
            }
        }
    }

}