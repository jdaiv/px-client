import Engine from './Engine'
import Entity from './Entity'

export default class Stage {

    protected engine: Engine
    protected entities: Entity[]
    public particles: any[]

    constructor(engine: Engine) {
        this.engine = engine
        this.entities = []
    }

    public tick(dt: number) {
        this.entities.forEach(e => e.active && e.tick(dt))
    }

    public draw(dt: number) {
        this.entities.forEach(e => e.active && e.draw(dt))
    }

    public lateTick(dt: number) {
        this.entities.forEach(e => {
            if (e.destroyed === true) this.removeEntity(e)
        })
    }

    public addEntity(e: Entity) {
        e.init(this.engine)
        this.entities.push(e)
        return e
    }

    public removeEntity(e: Entity) {
        const idx = this.entities.indexOf(e)
        if (idx >= 0) this.entities.splice(idx, 1)
    }

}
