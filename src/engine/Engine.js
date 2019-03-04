import Video from './Video'
import Overlay from './Overlay'
import Synth from './audio/Synth'
import MaterialManager from './Materials'
import Resources from './Resources'
import Station from './stages/Station'
import Camera from './Camera'

export default class Engine {

    camera = new Camera()
    players = {}
    me = null

    constructor (el, ui) {
        console.log('[engine] starting...')
        this.ui = ui
        this.v = new Video(el, this)
        this.overlay = new Overlay(el)
        this.synth = new Synth()
        Resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            MaterialManager.load()
            this.v.initQueue()
            this.activeStage = new Station(this)
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
            this.activeStage.lateTick(this.dt)
            this.v.run(this.dt, this.time, () => this.activeStage.draw(this.dt))
            this.overlay.run(this.dt)
            this.synth.tick(this.dt)
        }
    }

}