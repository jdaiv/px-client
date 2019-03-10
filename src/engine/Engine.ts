// import Overlay from './Overlay'
// import Synth from './audio/Synth'
import UIStore from '../stores/UIStore'
import Camera from './Camera'
import { Material, MaterialManager } from './Materials'
import Overlay from './Overlay'
import Resources from './Resources'
import Stage from './Stage'
import Station from './stages/Station'
import Video from './Video'

export default class Engine {

    public resources: Resources
    public materials: Map<string, Material>
    public ui: UIStore
    public camera: Camera
    public v: Video
    public activeStage: Stage
    public overlay: Overlay

    public time: number
    public dt: number
    public raf: number

    constructor(el: HTMLElement, ui: UIStore) {
        console.log('[engine] starting...')
        this.ui = ui
        this.resources = new Resources()
        this.camera = new Camera()
        this.v = new Video(el, this)
        this.overlay = new Overlay(el)
        // this.synth = new Synth()
        this.resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            this.materials = MaterialManager.load(this.resources)
            this.v.initQueue()
            this.activeStage = new Station(this)
            this.start()
        })
    }

    public start() {
        this.time = -1
        this.raf = window.requestAnimationFrame(this.loop)
    }

    public stop() {
        window.cancelAnimationFrame(this.raf)
    }

    public destroy() {
        console.log('[engine] destroy called')
        this.v.destroy()
        window.cancelAnimationFrame(this.raf)
    }

    public loop = (t: number) => {
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
            // this.synth.tick(this.dt)
        }
    }

}
