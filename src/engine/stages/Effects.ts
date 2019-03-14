import { vec3 } from 'gl-matrix'
import Engine from '../Engine'
import { Emitter } from '../Particles'
import { TILE_SIZE } from './Tiles'

export default class Effects {

    private engine: Engine
    private bloodEmitter: Emitter

    constructor(engine: Engine) {
        this.engine = engine
        this.bloodEmitter = engine.particles.newEmitter()
        this.bloodEmitter.dampening.set([1, 1, 1])
        this.bloodEmitter.gravity.set([0, -200, 0])
        this.bloodEmitter.velocity = [50, 80]
        this.bloodEmitter.size = [2, 4]
        this.bloodEmitter.lifetime = [10, 20]
        this.bloodEmitter.color = [200, 0, 0, 255]
        this.bloodEmitter.bounce = true
        this.bloodEmitter.spread = 0.25
        this.bloodEmitter.rotation = vec3.fromValues(0, 0, 90)
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
