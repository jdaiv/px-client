import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class FireBall implements IEffect {

    private trailEmitter: Emitter
    private emitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.trailEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, 20, 0),
            velocity: [0, 0],
            size: [2, 4],
            lifetime: [0.25, 0.75],
            color: [255, 100, 0, 255],
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
        })
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.1, 0.6, 0.1),
            gravity: vec3.fromValues(0, 50, 0),
            velocity: [0, 80],
            size: [4, 8],
            lifetime: [1, 3],
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
        const source = vec3.fromValues(params.sourceX * TILE_SIZE, 0, params.sourceY * TILE_SIZE)
        const target = vec3.fromValues(params.targetX * TILE_SIZE, 2, params.targetY * TILE_SIZE)

        while (t < 45) {
            const x = t / 45
            vec3.lerp(this.trailEmitter.position, source, target, x)
            this.trailEmitter.position[1] = (-1 * Math.pow(x, 2) + x) * 100 + 8
            this.trailEmitter.color[1] = Math.floor(Math.random() * 40 + 80)
            this.trailEmitter.emit(10)
            t++
            yield false
        }

        vec3.copy(this.emitter.position, target)
        const shake = 8
        this.engine.camera.addShake([shake, shake, shake])
        this.trailEmitter.emit(100)
        yield true
    }

}
