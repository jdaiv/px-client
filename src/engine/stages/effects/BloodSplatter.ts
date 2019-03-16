import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import { Emitter } from '../../Particles'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class BloodSplatter implements IEffect {

    private emitter: Emitter

    constructor(engine: Engine) {
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, -200, 0),
            velocity: [50, 80],
            size: [2, 4],
            lifetime: [10, 20],
            color: [200, 0, 0, 255],
            bounce: true,
            spread: 0.25,
            rotation: vec3.fromValues(0, 0, 90),
        })
    }

    public * run(params: any) {
        let t = 0

        while (t < 60) {
            vec3.set(this.emitter.position, params.x * TILE_SIZE, 8, params.y * TILE_SIZE)
            this.emitter.emit(100)
            t++
            return false
        }

        yield true
    }

}
