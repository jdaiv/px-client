// import Synth from './audio/Synth'
import Interactions from './Interactions'
import Overlay from './Overlay'
import Camera from './rendering/Camera'
import Foliage from './rendering/Foliage'
import Material from './rendering/Material'
import MaterialManager from './rendering/MaterialManager'
import Particles from './rendering/Particles'
import Terrain from './rendering/Terrain'
import Video from './rendering/Video'
import Resources from './Resources'
import Stage from './stage/Stage'

export default class Engine {

    public resources: Resources
    public materials: Map<string, Material>
    public camera: Camera
    public v: Video
    public particles: Particles
    public foliage: Foliage
    public terrain: Terrain
    public stage: Stage
    public overlay: Overlay
    public interactions: Interactions

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
        this.interactions = new Interactions()
        // this.synth = new Synth()
        this.resources.load(({ done, total }) => {
            console.log(`[engine/resources] loaded ${done}/${total}`)
        }).then(() => {
            this.terrain = new Terrain(
                this,
                this.materials.get('terrain'),
                this.resources.sprites.get('terrain'))
            this.particles = new Particles(this)
            this.foliage = new Foliage(this)
            this.v.initQueue()
            this.stage = new Stage(this)
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

        if (this.stage) {
            this.stage.tick(this.dt)
            this.v.run(this.dt, this.time, () => this.stage.draw())
            this.overlay.run(this.dt)
            // this.synth.tick(this.dt)
        }
    }

}
