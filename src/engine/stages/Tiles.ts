import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import { Emitter } from '../Particles'
import { TILE_SIZE_HALF } from '../Terrain'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private tiles: any[]
    private trees = new Map<number, any>()
    private rocks = new Map<number, any>()
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
            velocity: [25, 50],
            lifetime: [0.5, 1.5],
            color: [0, 255, 0, 255],
            cube: vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2),
            rotation: vec3.fromValues(0, 0, 90),
            shape: 'square',
            spread: 0.1
        })
    }

    private set = (state: GameState) => {
        this.tiles.length = 0
        const tiles = new Array<[vec3, number]>()
        state.tiles.forEach((t: any, i) => {
            tiles.push([t.position, t.type])
            this.tiles.push({
                type: t.type,
                position: vec3.mul(vec3.create(), t.position, [TILE_SIZE, -TILE_SIZE_HALF, TILE_SIZE]),
                rotation: vec3.create(),
                scale: vec3.fromValues(1, 1, 1),
            })
            if (t.type === 5 && !this.trees.has(i)) {
                const scale = Math.random() * 2 + 1
                const transform = {
                    position: vec3.mul(vec3.create(), t.position, [TILE_SIZE, 0, TILE_SIZE]),
                    scale: [scale, scale, scale],
                    rotation: [0, Math.random() * 360, 0],
                }
                transform.position[1] = 0
                this.trees.set(i, transform)
            } else if (t.type !== 5 && this.trees.has(i)) {
                this.trees.delete(i)
            }
            if (t.type === 6 && !this.rocks.has(i)) {
                const scale = Math.random() * 1 + 2
                const transform = {
                    position: vec3.mul(vec3.create(), t.position, [TILE_SIZE, 0, TILE_SIZE]),
                    scale: [scale, scale, scale],
                    rotation: [0, Math.random() * 360, 0],
                }
                transform.position[1] = 0
                this.rocks.set(i, transform)
            } else if (t.type !== 6 && this.rocks.has(i)) {
                this.rocks.delete(i)
            }
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
        const gm = GameManager.instance
        if (gm.store.editor.enabled) {
            this.tiles.forEach((p, i) => {
                this.engine.v.drawMesh('cube', p, 'textured', 'grid', {
                    draw: false,
                    callback: (type: string) => {
                        if (type === 'move') p.hover = true
                        else if (type === 'click') {
                            vec3.copy(this.clickEmitter.position, p.position)
                            this.clickEmitter.position[1] = 0
                            this.clickEmitter.emit(50)
                            switch (gm.store.editor.mode) {
                                case 'zone':
                                    gm.editAction({
                                        type: 'tile',
                                        idx: i,
                                        to: gm.store.editor.activeTile
                                    })
                                    break
                                case 'entity':
                                    if (gm.store.editor.selectedEntity === -1) {
                                        gm.editAction({
                                            type: 'entity_create',
                                            ent: gm.store.editor.activeEntity,
                                            x: Math.floor(p.position[0] / TILE_SIZE),
                                            y: Math.floor(p.position[2] / TILE_SIZE)
                                        })
                                    } else {
                                        gm.store.editor.selectedEntity = -1
                                    }
                                    break
                            }
                        }
                    }
                })
            })
        } else {
            this.trees.forEach((t) => {
                this.engine.v.drawMesh('tree', t, 'textured', 'colored')
            })
            this.rocks.forEach((t) => {
                this.engine.v.drawMesh('rocks', t, 'textured', 'colored')
            })
        }
    }

}
