import { vec3 } from 'gl-matrix'
import Engine from '../Engine'
import { Emitter } from '../Particles'
import { TILE_SIZE } from './Tiles'

export default class Effects {

    private engine: Engine
    private bloodEmitter: Emitter

    constructor(engine: Engine) {
        this.engine = engine
        this.bloodEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, -200, 0),
            velocity: [50, 80],
            size: [2, 4],
            lifetime: [10, 20],
            color: [200, 0, 0, 255],
            bounce: true,
            spread: 0.25,
            rotation: vec3.fromValues(0, 0, 90),
        })
    }

    public handleEffect = (data: any) => {
        if (data.type === 'wood_ex') {
            vec3.set(this.bloodEmitter.position, data.x * TILE_SIZE, 8, data.y * TILE_SIZE)
            this.bloodEmitter.emit(100)
        } else if (data.type === 'screen_shake') {
            this.engine.camera.addShake([data.x, 0, data.y])
        }
    }

}
