import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import { Emitter } from '../../Particles'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class Shock implements IEffect {

    private emitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.8, 1, 0.8),
            gravity: vec3.fromValues(0, -200, 0),
            velocity: [10, 20],
            size: [0.5, 1],
            lifetime: [0.1, 0.5],
            color: [50, 0, 128, 255],
            spread: 0.2,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'square',
            outline: false,
            cube: vec3.fromValues(8, 4, 8),
            bounce: 0.5
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.x * TILE_SIZE, 0, params.y * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        while (t < 5) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[2] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(50)
            t++
            yield false
        }
        this.emitter.velocity[0] = 0
        this.emitter.velocity[1] = 0
        while (t < 90) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[2] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(1)
            t++
            yield false
        }
        yield true
    }

}
