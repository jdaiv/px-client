export default class Stage {

    constructor (engine) {
        this.engine = engine
        this.entities = []
    }

    tick (dt) {
        this.entities.forEach(e => { e.tick(dt) })
    }

    draw (dt) {
        this.entities.forEach(e => { e.draw(dt) })
    }

    lateTick (dt) {
        this.entities.forEach(e => {
            if (e.destroyed === true) this.removeEntity(e)
        })
    }

    addEntity (e) {
        e.engine = this.engine
        this.entities.push(e)
        return e
    }

    removeEntity (e) {
        const idx = this.entities.indexOf(e)
        if (idx >= 0) this.entities.splice(idx, 1)
    }

}