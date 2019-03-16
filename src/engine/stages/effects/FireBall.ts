import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import { Emitter } from '../../Particles'
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
            bounce: true,
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
        })
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.95, 1, 0.95),
            gravity: vec3.fromValues(0, 1, 0),
            velocity: [5, 20],
            size: [2, 4],
            lifetime: [1, 3],
            color: [255, 100, 0, 255],
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'sphere',
            outline: false,
            cube: vec3.fromValues(0, 8, 8)
        })
    }

    public * run(params: any) {
        let t = 0
        const source = vec3.fromValues(params.origin[0] * TILE_SIZE, 0, params.origin[1] * TILE_SIZE)
        const target = vec3.fromValues(params.target[0] * TILE_SIZE, 2, params.target[1] * TILE_SIZE)

        while (t < 60) {
            const x = t / 60
            vec3.lerp(this.trailEmitter.position, source, target, x)
            this.trailEmitter.position[1] = (-1 * Math.pow(x, 2) + x) * 100 + 8
            this.emitter.color[1] = Math.floor(Math.random() * 60 + 80)
            this.trailEmitter.emit(10)
            t++
            yield false
        }

        vec3.copy(this.emitter.position, target)
        this.emitter.velocity[0] = 20
        this.emitter.velocity[1] = 60
        this.emitter.cube[1] = 8
        this.emitter.cube[2] = 8
        this.emitter.spread = 100
        this.emitter.emit(120)
        const shake = 8
        this.engine.camera.addShake([shake, shake, shake])
        while (t < 90) {
            vec3.copy(this.emitter.position, target)
            this.emitter.color[1] = Math.floor(Math.random() * 60 + 80)
            this.emitter.velocity[0] = 5
            this.emitter.velocity[1] = 20
            this.emitter.emit(2)
            t++
            yield false
        }
        yield true
    }

}
