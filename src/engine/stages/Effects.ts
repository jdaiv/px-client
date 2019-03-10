import { vec3 } from 'gl-matrix'
import Engine from '../Engine'
import Stage from '../Stage'
import { TILE_SIZE } from './Tiles'

function rand(range: number): number {
    return Math.random() * range * 2 - range
}
function randN(range: number): number {
    return Math.random() * range
}

export default class Effects {

    private parent: Stage
    private engine: Engine

    constructor(parent: Stage, engine: Engine) {
        this.parent = parent
        this.engine = engine
    }

    public handleEffect(data: any) {
        if (data.type === 'wood_ex') {
            for (let i = 0; i < 20; i++) {
                this.parent.particles.push({
                    position: vec3.fromValues(data.x * TILE_SIZE, 8, data.y * TILE_SIZE),
                    rotation: vec3.fromValues(rand(180), rand(180), rand(180)),
                    positionV: vec3.fromValues(rand(20), randN(100) + 50, rand(20)),
                    rotationV: vec3.fromValues(rand(180), rand(180), rand(180)),
                    scale: vec3.fromValues(0.25, 0.25, 0.25),
                    active: true
                })
            }
        } else if (data.type === 'screen_shake') {
            this.engine.camera.addShake([data.x, 0, data.y])
        }
    }

}
