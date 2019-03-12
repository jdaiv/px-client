import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager';
import GameState from '../../shared/GameState';
import Engine from '../Engine'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private tiles: any[]

    constructor(engine: Engine) {
        this.engine = engine
        this.tiles = []
        GameManager.instance.state.registerListener(this.set)
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
            const target = vec3.clone(p.position)
            target[1] = -TILE_SIZE / 2
            if (p.hover) target[1] += 4
            p.hover = false
            vec3.lerp(p.position, p.position, target, dt * 10)
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
