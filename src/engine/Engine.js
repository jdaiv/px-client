import Video from './Video'
import MaterialManager from './MaterialManager'
import Resources from './Resources'
import Station from './stages/Station'
import { Vector2 } from './Vector'

export default class Engine {

    camera = { offset: new Vector2(), zoom: 1 }

    constructor (el) {
        console.log('[engine] starting...')
        this.v = new Video(el)
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
            return
        }

        this.dt = (t - this.time) / 1000
        this.time = t

        if (this.activeStage) {
            this.activeStage.tick(this.dt)
            this.v.clear()
            // this.v.ctx.save()
            // this.v.ctx.translate(
            //     Math.floor(this.v.width / 2 + this.camera.offset.x),
            //     Math.floor(this.v.height / 2 + this.camera.offset.y)
            // )
            // this.v.ctx.scale(this.camera.zoom, this.camera.zoom)
            this.activeStage.draw(this.dt)
            this.v.run()
            // this.v.ctx.fillStyle = '#00f'
            // this.v.ctx.fillRect(-1, -1, 2, 2)
            // this.v.ctx.restore()
            this.activeStage.lateTick(this.dt)
        }
    }

}