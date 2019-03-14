import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import { Emitter } from '../Particles'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private tiles: any[]
    private sparkleEmitter: Emitter

    constructor(engine: Engine) {
        this.engine = engine
        this.tiles = []
        GameManager.instance.state.registerListener(this.set)

        const e = engine.particles.newEmitter()
        e.dampening.set([0.9, 0.9, 0.9])
        e.gravity.set([0, 0, 0])
        e.size = [0.5, 1]
        e.velocity = [10, 20]
        e.lifetime = [0.25, 0.5]
        e.color = [0, 255, 0, 255]
        e.shape = 'square'
        e.cube = vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2)
        e.rotation = vec3.fromValues(0, 0, 90)
        e.outline = true
        e.spread = 0.4
        this.sparkleEmitter = e
    }

    private set = (state: GameState) => {
        this.tiles.length = 0
        state.tiles.forEach((t: any, i: number) => {
            this.tiles.push({
                type: t.type,
                position: vec3.multiply(
                    vec3.create(),
                    t.position,
                    [
                        TILE_SIZE,
                        -TILE_SIZE / 2,
                        TILE_SIZE,
                    ]),
                rotation: vec3.create(),
                scale: vec3.fromValues(1, 1, 1)
            })
        })
    }

    public tick(dt: number) {
        this.tiles.forEach((p, i) => {
            if (p.hover) {
                vec3.copy(this.sparkleEmitter.position, p.position)
                this.sparkleEmitter.position[1] = 0
                this.sparkleEmitter.emit(2)
            }
            p.hover = false
        })
    }

    public draw() {
        this.tiles.forEach((p, i) => {
            this.engine.v.drawMesh('cube', p, 'textured', p.type !== 'default' ? p.type : 'grid', {
                callback: () => {
                    p.hover = true
                }
            })
        })
    }

}
