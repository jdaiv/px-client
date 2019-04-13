import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class Ice implements IEffect {

    private emitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, 0, 0),
            velocity: [0, 0],
            size: [6, 12],
            lifetime: [1, 3],
            color: [20, 255, 255, 255],
            spread: 10,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'cube',
            outline: false,
            cube: vec3.fromValues(8, 8, 8)
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.targetX * TILE_SIZE, 2, params.targetY * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        while (t < 25) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[0] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(10)
            t++
        }
        const shake = 2
        this.engine.camera.addShake([shake, shake, shake])
        yield true
    }

}
