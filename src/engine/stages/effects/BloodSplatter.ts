import { vec3 } from 'gl-matrix'
import Engine from '../../Engine'
import { Emitter } from '../../Particles'
import { TILE_SIZE } from '../Tiles'
import IEffect from './IEffect'

export default class BloodSplatter implements IEffect {

    private emitter: Emitter

    constructor(engine: Engine) {
        this.emitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.6, 1, 0.6),
            gravity: vec3.fromValues(0, -50, 0),
            velocity: [-10, 10],
            size: [0.5, 1],
            lifetime: [5, 10],
            color: [150, 0, 0, 255],
            bounce: 0.5,
            spread: 100,
            // rotation: vec3.fromValues(0, 0, 90),
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
            vec3.scale(x, x, Math.random() * 20 + 10)
            if (x[1] < 0) {
                x[1] = -x[1]
            }
            x[1] *= 6
            chunks[i] = x
            chunksPos[i] = vec3.clone(pos)
        }

        vec3.copy(this.emitter.position, pos)
        // this.emitter.emit(10)

        while (t < 60) {
            chunks.forEach((x, i) => {
                const cPos = chunksPos[i]
                x[1] -= 200 * 1 / 60
                vec3.scaleAndAdd(cPos, cPos, x, 1 / 60)
                vec3.copy(this.emitter.position, cPos)
                if (cPos[1] < 0) {
                    cPos[1] = 0
                    x[1] *= -0.5
                }
                this.emitter.size[0] = 1 * 1 - (t / 60)
                this.emitter.size[1] = 2 * 1 - (t / 60)
                this.emitter.velocity[0] = -15 * 1 - (t / 60)
                this.emitter.velocity[1] = 15 * 1 - (t / 60)
                this.emitter.emit(20)
            })

            t++
            yield false
        }

        yield true
    }

}
