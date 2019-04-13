import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class Lightning implements IEffect {

    private emitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.8, 0.8, 0.8),
            gravity: vec3.fromValues(0, 0, 0),
            velocity: [10, 20],
            size: [4, 8],
            lifetime: [0.25, 0.5],
            color: [50, 0, 128, 255],
            spread: 10,
            rotation: vec3.fromValues(0, 0, 0),
            shape: 'cube',
            outline: false,
            cube: vec3.fromValues(1, 64, 1)
        })
    }

    public * run(params: any) {
        let t = 0
        const target = vec3.fromValues(params.targetX * TILE_SIZE, 64, params.targetY * TILE_SIZE)

        vec3.copy(this.emitter.position, target)
        while (t < 25) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[2] = Math.floor(Math.random() * 200 + 50)
            this.emitter.emit(50)
            t++
        }
        const shake = 4
        this.engine.camera.addShake([shake, shake, shake])
        yield true
    }

}
