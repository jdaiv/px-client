import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class IceBolt implements IEffect {

    private trailEmitter: Emitter
    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.trailEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, 20, 0),
            velocity: [0, 0],
            size: [2, 4],
            lifetime: [0.25, 0.75],
            color: [0, 255, 255, 255],
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
        })
    }

    public * run(params: any) {
        let t = 0
        const source = vec3.fromValues(params.sourceX * TILE_SIZE, 0, params.sourceY * TILE_SIZE)
        const target = vec3.fromValues(params.targetX * TILE_SIZE, 2, params.targetY * TILE_SIZE)

        while (t < 15) {
            const x = t / 15
            vec3.lerp(this.trailEmitter.position, source, target, x)
            this.trailEmitter.position[1] = 8
            this.trailEmitter.color[1] = Math.floor(Math.random() * 200 + 50)
            this.trailEmitter.emit(10)
            t++
            yield false
        }
        yield true
    }

}
