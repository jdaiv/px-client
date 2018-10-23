export default class Physics {

    colliders = []

    addCollider (c) {
        this.colliders.push(c)
    }

    removeCollider (c) {
        const idx = this.colliders.indexOf(c)
        if (idx >= 0) this.colliders.splice(idx, 1)
    }

}