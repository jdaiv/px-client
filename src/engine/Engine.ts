// import Synth from './audio/Synth'
import Camera from './Camera'
import { Material, MaterialManager } from './Materials'
import Overlay from './Overlay'
import Particles from './Particles'
import Resources from './Resources'
import Stage from './Stage'
import Station from './stages/Station'
import Terrain from './Terrain'
import Video from './Video'

export default class Engine {

    public resources: Resources
    public materials: Map<string, Material>
    public camera: Camera
    public v: Video
    public particles: Particles
    public terrain: Terrain
    public activeStage: Stage
    public overlay: Overlay

    public time: number
    public dt: number
    public raf: number

    constructor(el: HTMLElement) {
        console.log('[engine] starting...')
        this.resources = new Resources()
        this.camera = new Camera()
        this.v = new Video(el, this)
        this.materials = MaterialManager.load()
        this.overlay = new Overlay(el)
        // this.synth = new Synth()
        this.resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            this.terrain = new Terrain(
                this,
                this.materials.get('terrain'),
                this.resources.sprites.get('terrain'))
            this.particles = new Particles(this.materials.get('particle'))
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
            // this.particles.tick()
            this.v.run(this.dt, this.time, () => this.activeStage.draw(this.dt))
            this.overlay.run(this.dt)
            // this.synth.tick(this.dt)
        }
    }

}
