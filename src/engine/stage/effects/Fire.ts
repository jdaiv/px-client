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
            dampening: vec3.fromValues(0.1, 0.6, 0.1),
            gravity: vec3.fromValues(0, 20, 0),
            velocity: [0, 80],
            size: [2, 4],
            lifetime: [0.5, 3],
            color: [255, 100, 0, 255],
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'square',
            outline: false,
            cube: vec3.fromValues(8, 8, 1),
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.x * TILE_SIZE, -2, params.y * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        this.emitter.velocity[1] = 80
        while (t < 8) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[1] = Math.floor(Math.random() * 120 + 80)
            this.emitter.emit((8 - t) * 10)
            t++
            yield false
        }
        this.emitter.velocity[1] = 10
        while (t < 120) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[1] = Math.floor(Math.random() * 120 + 80)
            this.emitter.emit(2)
            t++
            yield false
        }
        yield true
    }

}
