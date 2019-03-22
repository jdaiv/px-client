import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import { Emitter } from '../../Particles'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class Fire implements IEffect {

    private emitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.95, 1, 0.95),
            gravity: vec3.fromValues(0, 1, 0),
            velocity: [5, 20],
            size: [0.5, 1],
            lifetime: [1, 3],
            color: [255, 100, 0, 255],
            spread: 0.1,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'sphere',
            outline: false,
            cube: vec3.fromValues(0, 8, 8)
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.x * TILE_SIZE, 2, params.y * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        this.emitter.velocity[0] = 20
        this.emitter.velocity[1] = 60
        this.emitter.cube[1] = 8
        this.emitter.cube[2] = 8
        this.emitter.spread = 100
        while (t < 15) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[1] = Math.floor(Math.random() * 120 + 80)
            this.emitter.emit(10)
            t++
            yield false
        }
        yield true
    }

}
