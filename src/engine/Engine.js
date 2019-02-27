import Video from './Video'
import Overlay from './Overlay'
import Synth from './audio/Synth'
import MaterialManager from './Materials'
import Resources from './Resources'
import Station from './stages/Station'
import { vec3 } from 'gl-matrix'

export default class Engine {

    camera = {
        target: vec3.create(),
        offset: vec3.fromValues(0, 90, 120),
        targetFov: 50,
        fov: 50
    }
    players = {}
    me = null

    constructor (el) {
        console.log('[engine] starting...')
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
            this.v.run(this.time, () => this.activeStage.draw(this.dt))
            this.overlay.run(this.dt)
            this.synth.tick(this.dt)
        }
    }

}