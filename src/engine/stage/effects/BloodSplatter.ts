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
            // dampening: vec3.fromValues(0.2, 0.2, 0.2),
            gravity: vec3.fromValues(0, 0, 0),
            velocity: [-2, -8],
            size: [0.25, 0.5],
            lifetime: [0.5, 1],
            color: [255, 0, 0, 255],
            bounce: 0.5,
            spread: 0.5,
        })
        this.splatEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, -50, 0),
            velocity: [2, 4],
            size: [2, 4],
            lifetime: [5, 20],
            color: [255, 0, 0, 255],
            bounce: 0,
            spread: 1,
            fadeTime: 0,
        })
    }

    public * run(params: any) {
        let t = 0
        const pos = vec3.fromValues(params.x * TILE_SIZE, 8, params.y * TILE_SIZE)
        const numChunks = 15
        const chunks = new Array(numChunks)
        const chunksPos = new Array(numChunks)
        const chunksPosPrev = new Array(numChunks)
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
            chunksPosPrev[i] = vec3.clone(pos)
            vec3.scaleAndAdd(chunksPos[i], chunksPos[i], x, 5 / 60)
        }

        this.engine.stage.player.swordAttack = 2

        vec3.copy(this.emitter.position, pos)
        // this.emitter.emit(10)

        while (t < 60) {
            chunks.forEach((x, i) => {
                const dt = 1 / 60
                const cPos = chunksPos[i]
                vec3.copy(chunksPosPrev[i], cPos)
                x[1] -= 200 * dt
                x[0] -= x[0] * 2 * dt
                x[2] -= x[2] * 2 * dt
                vec3.scaleAndAdd(cPos, cPos, x, dt)
                vec3.copy(this.emitter.position, cPos)
                if (cPos[1] <= 1) {
                    cPos[1] = 0.1
                    // x[1] *= -0.5
                    // x[1] = 0
                    vec3.copy(this.splatEmitter.position, cPos)
                    vec3.scaleAndAdd(x, x, x, -dt * 2)
                    this.splatEmitter.emit(4)
                } else {
                    const duration = t / 60
                    vec3.sub(this.emitter.emitDir, cPos, chunksPosPrev[i])
                    this.emitter.size[0] = 4 * (1 - duration) + 0.25
                    this.emitter.size[1] = 8 * (1 - duration) + 0.25
                    this.emitter.velocity[0] = 0 * Math.pow(1 - duration, 4) - 2
                    this.emitter.velocity[1] = -10 * Math.pow(1 - duration, 4) + 2
                    // this.emitter.color[0] = this.splatEmitter.color[0] = Math.random() * 20 + 200
                    this.emitter.emit(4)
                }
            })

            t++
            yield false
        }

        yield true
    }

}
