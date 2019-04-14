import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
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
            velocity: [10, 60],
            size: [1, 2],
            lifetime: [1, 3],
            color: [50, 0, 128, 255],
            spread: 0.5,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'cube',
            outline: false,
            cube: vec3.fromValues(8, 0.5, 8),
            bounce: 0.8
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.targetX * TILE_SIZE, 1, params.targetY * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        while (t < 5) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[2] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(50)
            t++
            yield false
        }
        while (t < 45) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[2] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(1)
            t++
            yield false
        }
        yield true
    }

}
