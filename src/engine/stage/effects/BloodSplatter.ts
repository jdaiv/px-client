import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import Emitter from '../../rendering/particles/Emitter'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class BloodSplatter implements IEffect {

    private emitter: Emitter
    private splatEmitter: Emitter
    public engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.6, 0.6, 0.6),
            gravity: vec3.fromValues(0, 0, 0),
            velocity: [-10, 10],
            size: [0.5, 1],
            lifetime: [0.5, 1],
            color: [150, 0, 0, 255],
            bounce: 0.5,
            spread: 10,
            rotation: vec3.fromValues(0, 0, 90),
        })
        this.splatEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.6, 0.6, 0.6),
            gravity: vec3.fromValues(0, -100, 0),
            velocity: [1, 6],
            size: [0.5, 1],
            lifetime: [5, 20],
            color: [150, 0, 0, 255],
            bounce: 0,
            spread: 1,
            rotation: vec3.fromValues(0, 0, 90),
        })
    }

    public * run(params: any) {
        let t = 0
        const pos = vec3.fromValues(params.x * TILE_SIZE, 8, params.y * TILE_SIZE)
        const numChunks = 10
        const chunks = new Array(numChunks)
        const chunksPos = new Array(numChunks)
        for (let i = 0; i < numChunks; i++) {
            const x = vec3.create()
            vec3.random(x)
            vec3.scale(x, x, Math.random() * 40 + 20)
            if (x[1] < 0) {
                x[1] = -x[1]
            }
            x[1] *= 3
            chunks[i] = x
            chunksPos[i] = vec3.clone(pos)
            vec3.scaleAndAdd(chunksPos[i], chunksPos[i], x, 5 / 60)
        }

        this.engine.stage.player.swordAttack = 1

        vec3.copy(this.emitter.position, pos)
        // this.emitter.emit(10)

        while (t < 60) {
            chunks.forEach((x, i) => {
                const dt = 1 / 60
                const cPos = chunksPos[i]
                x[1] -= 200 * dt
                x[0] -= x[0] * 2 * dt
                x[2] -= x[2] * 2 * dt
                vec3.scaleAndAdd(cPos, cPos, x, dt)
                vec3.copy(this.emitter.position, cPos)
                if (cPos[1] < 0) {
                    cPos[1] = 1
                    x[1] *= -0.5
                    vec3.copy(this.splatEmitter.position, cPos)
                    this.splatEmitter.emit(20)
                }
                const duration = t / 60
                this.emitter.size[0] = 1 * (1 - duration) + 0.25
                this.emitter.size[1] = 2 * (1 - duration) + 0.25
                this.emitter.velocity[0] = -10 * Math.pow(1 - duration, 4) - 2
                this.emitter.velocity[1] = 10 * Math.pow(1 - duration, 4) + 2
                this.emitter.emit(20)
            })

            t++
            yield false
        }

        yield true
    }

}
