import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import { Emitter } from '../Particles'
import Station from './Station'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private tiles: any[]
    private sparkleEmitter: Emitter
    private clickEmitter: Emitter

    constructor(engine: Engine) {
        this.engine = engine
        this.tiles = []
        GameManager.instance.state.registerListener(this.set)

        this.sparkleEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.9, 0.9, 0.9),
            gravity: vec3.fromValues(0, 0, 0),
            size: [0.5, 1],
            velocity: [10, 20],
            lifetime: [0.25, 0.5],
            color: [0, 255, 0, 255],
            shape: 'square',
            cube: vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2),
            rotation: vec3.fromValues(0, 0, 90),
            outline: true,
            spread: 0.4,
        })
        this.clickEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, -200, 0),
            size: [0.5, 1],
            velocity: [25, 75],
            lifetime: [1, 2],
            color: [0, 255, 0, 255],
            cube: vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2),
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'square',
            spread: 0,
            bounce: 1
        })
    }

    private set = (state: GameState) => {
        this.tiles.length = 0
        const tiles = new Array<[vec3, number]>()
        state.tiles.forEach((t: any) => {
            let type = 2
            switch (t.type) {
                case 'grass': type = 3; break
                case 'water': type = 4; break
            }
            tiles.push([t.position, type])
        })
        this.engine.terrain.set(tiles, state.mapWidth, state.mapHeight)
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
        // const state = GameManager.instance.state
        // this.tiles.forEach((p, i) => {
        //     this.engine.v.drawMesh('cube', p, 'textured', p.type !== 'default' ? p.type : 'grid', {
        //         callback: (type: string) => {
        //             if (type === 'move') p.hover = true
        //             else if (type === 'click') {
        //                 const player = state.activePlayer
        //                 const tile = state.tiles[i]
        //                 const stage = this.engine.activeStage as Station
        //                 stage.effects.handleEffect({
        //                     type: 'fireball',
        //                     origin: [player.x, player.y],
        //                     target: [tile.position[0], tile.position[2]]
        //                 })
        //             }
        //         }
        //     })
        // })
    }

}
