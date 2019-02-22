export default class Stage {

    constructor (engine) {
        this.engine = engine
        this.entities = []
        this.networkedEntities = new Map()
    }

    tick (dt) {
        this.networkedEntities.forEach(e => { e.active && e.tick(dt) })
        this.entities.forEach(e => { e.active && e.tick(dt) })
    }

    draw (dt) {
        this.networkedEntities.forEach(e => { e.active && e.draw(dt) })
        this.entities.forEach(e => { e.active && e.draw(dt) })
    }

    lateTick (dt) {
        this.networkedEntities.forEach(e => {
            if (e.destroyed === true) this.removeEntity(e)
        })
        this.entities.forEach(e => {
            if (e.destroyed === true) this.removeEntity(e)
        })
    }

    addEntity (e) {
        e.engine = this.engine
        e.init()
        this.entities.push(e)
        return e
    }

    removeEntity (e) {
        const idx = this.entities.indexOf(e)
        if (idx >= 0) this.entities.splice(idx, 1)
    }

    addNetworkedEntity (e) {
        e.engine = this.engine
        this.networkedEntities.set(e.networkId, e)
        return e
    }

    removeNetworkedEntity (e) {
        this.networkedEntities.delete(e.networkId)
    }

}