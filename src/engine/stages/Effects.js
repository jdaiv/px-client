import { vec3 } from 'gl-matrix'

const tileSize = 16

function rand (range) {
    return Math.random() * range * 2 - range
}
function randN (range) {
    return Math.random() * range
}

export default class Effects {

    constructor (parent, engine) {
        this.parent = parent
        this.engine = engine
    }

    handleEffect (data) {
        if (data.type == 'wood_ex') {
            for (let i = 0; i < 20; i++) {
                this.parent.particles.push({
                    position: vec3.fromValues(data.x * tileSize, 8, data.y * tileSize),
                    rotation: vec3.fromValues(rand(180), rand(180), rand(180)),
                    positionV: vec3.fromValues(rand(20), randN(100) + 50, rand(20)),
                    rotationV: vec3.fromValues(rand(180), rand(180), rand(180)),
                    scale: vec3.fromValues(0.25, 0.25, 0.25),
                    active: true
                })
            }
        } else if (data.type == 'screen_shake') {
            this.engine.camera.addShake([data.x, 0, data.y])
        }
    }

}