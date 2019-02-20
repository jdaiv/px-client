import Video from './Video'
import Overlay from './Overlay'
import Synth from './audio/Synth'
import MaterialManager from './MaterialManager'
import Resources from './Resources'
import Station from './stages/Station'

export default class Engine {

    camera = { offset: [0, 0], zoom: 1 }
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
            this.v.run(this.time, () => this.activeStage.draw(this.dt))
            this.overlay.run()
            this.synth.tick(this.dt)
        }
    }

}