import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import FoliageEmitter from '../rendering/foliage/FoliageEmitter'
import Emitter from '../rendering/particles/Emitter'
import { TILE_SIZE_HALF } from '../rendering/Terrain'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private trees = new Map<string, FoliageEmitter>()
    private rocks = new Map<string, any>()
    private grass = new Map<string, boolean>()
    private sparkleEmitter: Emitter
    private clickEmitter: Emitter
    private foamEmitter: Emitter
    private leafEmitter: Emitter
    private grassEmitter: FoliageEmitter
    private leafLocations: Map<FoliageEmitter, [number[], vec3[]]>
    private fnQueue: Array<() => void> = []
    private hover = false

    constructor(engine: Engine) {
        this.engine = engine
        GameManager.instance.state.registerListener(this.set)

        this.sparkleEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.9, 0.9, 0.9),
            gravity: vec3.fromValues(0, 0, 0),
            size: [0.5, 1],
            velocity: [0, 5],
            lifetime: [0.25, 0.5],
            color: [0, 255, 0, 255],
            shape: 'square',
            cube: vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, 2),
            outline: true,
            spread: 0.4,
        })
        this.leafEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.9, 0.9, 0.9),
            gravity: vec3.fromValues(1, -3, 1),
            size: [1, 2],
            velocity: [0, 5],
            lifetime: [20, 30],
            color: [0, 50, 0, 255],
            shape: 'sphere',
            cube: vec3.fromValues(10, 10, 10),
            // bounce: 0.0
        })
        this.leafLocations = new Map()
        this.clickEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(1, 1, 1),
            gravity: vec3.fromValues(0, -200, 0),
            size: [0.5, 1],
            velocity: [25, 50],
            lifetime: [0.5, 1.5],
            color: [0, 255, 0, 255],
            cube: vec3.fromValues(TILE_SIZE / 2, TILE_SIZE / 2, 1),
            shape: 'square',
            spread: 0.1
        })
        this.foamEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.9, 0.9, 0.9),
            gravity: vec3.fromValues(-2, 0, -1),
            size: [1, 2],
            velocity: [0, 0.5],
            lifetime: [5, 10],
            color: [100, 0, 255, 255],
            shape: 'cube',
            cube: vec3.fromValues(1 * TILE_SIZE, 0, 1 * TILE_SIZE),
            outline: false,
            spread: 1,
            fadeTime: 0.2
        })
        this.grassEmitter = engine.foliage.getEmitter()
    }

    private set = (state: GameState, zoneChanged: boolean, mapChanged: boolean) => {
        if (zoneChanged) {
            this.trees.clear()
            this.rocks.clear()
            this.grass.clear()
        }
        if (mapChanged) {
            this.engine.terrain.set(state.tiles, [0, 0], [state.mapWidth, state.mapHeight])
            this.grassEmitter.destroy()
            this.grassEmitter = this.engine.foliage.getEmitter()
        }
        for (let x = 0; x < state.mapWidth; x++) {
            for (let y = 0; y < state.mapHeight; y++) {
                const t = state.tiles[x + y * state.mapWidth]
                const i = x + ',' + y
                if (t.id === 5 && !this.trees.has(i)) {
                    const emitter = this.engine.foliage.getEmitter()
                    emitter.base = vec3.fromValues(TILE_SIZE * x, 0, TILE_SIZE * y)
                    this.leafLocations.set(emitter, [[0, 0, 0, 0], []])
                    this.makeTree(emitter)
                    this.trees.set(i, emitter)
                } else if (t.id !== 5 && this.trees.has(i)) {
                    const emitter = this.trees.get(i)
                    emitter.destroy()
                    this.trees.delete(i)
                }
                if (t.id === 6 && !this.rocks.has(i)) {
                    const scale = Math.random() * 2 + 2
                    const transform = {
                        position: vec3.fromValues(TILE_SIZE * x, 0, TILE_SIZE * y),
                        scale: [scale, scale, scale],
                        rotation: [0, Math.random() * 360, 0],
                    }
                    vec3.add(transform.position, transform.position, [Math.random() * 4 - 2, 0, Math.random() * 4 - 2])
                    transform.position[1] = 0
                    this.rocks.set(i, transform)
                } else if (t.id !== 6 && this.rocks.has(i)) {
                    this.rocks.delete(i)
                }

                if (t.id !== 4 && !this.grass.get(i)) {
                    for (let j = 0; j < Math.random() * 40 + 40; j++) {
                        const rX = TILE_SIZE * x + Math.random() * TILE_SIZE - TILE_SIZE_HALF
                        const rY = TILE_SIZE * y + Math.random() * TILE_SIZE - TILE_SIZE_HALF
                        const start = vec3.fromValues(rX, 0, rY)
                        const end = vec3.fromValues(rX, Math.random() * 8 + 4, rY)
                        this.grassEmitter.add(
                            start, end, [0, Math.random() * 50 + 25, 0, 1], Math.random() * 1 + 0.5
                        )
                    }
                    this.grass.set(i, true)
                }
            }
        }
    }

    private foamTimer = 0
    private leafTimer = 0

    public tick(dt: number) {
        const gm = GameManager.instance
        // if (this.foamTimer > 0.05) {
        //     const halfW = ((gm.state.mapWidth) / 2 + 64.5) * TILE_SIZE
        //     const halfH = ((gm.state.mapHeight) / 2 + 64.5) * TILE_SIZE
        //     this.foamEmitter.position[0] = (gm.state.mapWidth) * TILE_SIZE / 2
        //     this.foamEmitter.position[1] = -4
        //     this.foamEmitter.position[2] = (gm.state.mapHeight) * TILE_SIZE / 2
        //     this.foamEmitter.cube[0] = halfW
        //     this.foamEmitter.cube[2] = halfH
        //     this.foamEmitter.emit(100)
        //     this.foamTimer = 0
        // }
        // this.foamTimer += dt

        if (this.hover) {
            this.sparkleEmitter.position[1] = 0
            this.sparkleEmitter.emit(20)
        }
        this.hover = false

        if (this.leafLocations.size > 0 && this.leafTimer > 0.2) {
            const arr = Array.from(this.leafLocations)
            const tree = arr[Math.floor(Math.random() * arr.length)][1]
            this.leafEmitter.color = tree[0]
            tree[1].forEach(v => {
                vec3.copy(this.leafEmitter.position, v)
                this.leafEmitter.emit(1)
            })
            this.leafTimer = 0
        }
        this.leafTimer += dt

        let todo = 0
        while (this.fnQueue.length > 0 && todo < 20) {
            this.fnQueue.shift()()
            todo++
        }

        this.engine.terrain.texture = gm.store.editor.enabled ?
            this.engine.resources.sprites.get('terrain-dev') :
            this.engine.resources.sprites.get('terrain')

        if (gm.store.editor.enabled || (gm.state.inCombat && gm.state.combat.casting)) {
            const position = vec3.fromValues(1, -TILE_SIZE_HALF, 1)
            for (let x = 0; x < gm.state.mapHeight; x++) {
                for (let y = 0; y < gm.state.mapHeight; y++) {
                    position[0] = TILE_SIZE * x
                    position[2] = TILE_SIZE * y
                    const p = vec3.clone(position)
                    this.engine.interactions.addItem(
                        {
                            min: vec3.fromValues(
                                TILE_SIZE * x - TILE_SIZE_HALF,
                                -TILE_SIZE,
                                TILE_SIZE * y - TILE_SIZE_HALF),
                            max: vec3.fromValues(
                                TILE_SIZE * x + TILE_SIZE_HALF,
                                0,
                                TILE_SIZE * y + TILE_SIZE_HALF)
                        },
                        this.tileHover,
                        this.tileClick,
                        { position: p, x, y }
                    )
                }
            }
        }
    }

    public tileHover = (d: any) => {
        vec3.copy(this.sparkleEmitter.position, d.position)
        this.hover = true
    }

    public tileClick = (d: any) => {
        const gm = GameManager.instance

        if (!gm.store.editor.enabled) {
            gm.playerSpell(gm.state.combat.activeSpell, d.x, d.y)
            return
        }
        vec3.copy(this.clickEmitter.position, d.position)
        this.clickEmitter.position[1] = 0
        this.clickEmitter.emit(50)
        switch (gm.store.editor.mode) {
            case 'zone':
                gm.editAction({
                    type: 'tile',
                    x: d.x,
                    y: d.y,
                    to: gm.store.editor.activeTile
                })
                break
            case 'entity':
                if (gm.store.editor.selectedEntity === -1) {
                    gm.editAction({
                        type: 'entity_create',
                        ent: gm.store.editor.activeEntity,
                        x: d.x,
                        y: d.y
                    })
                } else {
                    gm.store.editor.selectedEntity = -1
                }
                break
        }
    }

    public draw() {
        const gm = GameManager.instance

        if (!gm.store.editor.enabled) {
            this.rocks.forEach((t) => {
                this.engine.v.drawMesh('rocks', t, 'textured', 'colored')
            })
        }
    }

    private makeTree(emitter: FoliageEmitter) {
        this.fnQueue.push(() => this.treeRecurse(emitter, vec3.fromValues(0, 0, 0),
            [10 + Math.random() * 40, 5 + Math.random() * 20, 4, 1],
            [0, 25 + Math.random() * 100, 0, 1], 1))
    }

    private treeRecurse(emitter: FoliageEmitter, start: vec3, color: number[], leafColor: number[], depth: number) {
        if (depth > 5) {
            const loc = this.leafLocations.get(emitter)
            loc[0] = leafColor
            loc[1].push(vec3.add(vec3.create(), emitter.base, start))
            this.fnQueue.push(() => this.makeLeaves(emitter, start, leafColor))
            return
        }
        const dir = vec3.fromValues(
            Math.random() * depth / 2 - depth / 4, 1,
            Math.random() * depth / 2 - depth / 4)
        vec3.normalize(dir, dir)
        vec3.scaleAndAdd(dir, start, dir, Math.random() * 40 + 5)
        emitter.add(
            start,
            dir,
            color,
            (1 - dir[1] / 256) * 8 + 4
        )
        for (let i = 0; i < Math.random() * 1 + 1; i++) {
            this.fnQueue.push(() => this.treeRecurse(emitter, dir, color, leafColor,
                depth + Math.floor(Math.random() * 2 + 1)))
        }
    }

    private makeLeaves(emitter: FoliageEmitter, start: vec3, color: number[]) {
        const pos = vec3.create()
        const end = vec3.create()
        for (let j = 0; j < Math.random() * 10 + 10; j++) {
            vec3.set(pos, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            vec3.normalize(pos, pos)
            vec3.scaleAndAdd(pos, start, pos, Math.random() * 10 + 5)
            vec3.add(end, pos, [0, Math.random() * 10 + 2, 0])
            emitter.add(
                pos,
                end,
                color,
                Math.random() * 5 + 5
            )
        }
    }

}
