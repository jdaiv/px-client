import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import Emitter from '../rendering/particles/Emitter'
import { TILE_SIZE_HALF } from '../rendering/Terrain'

export const TILE_SIZE = 16

export default class Tiles {

    private engine: Engine
    private trees = new Map<string, any>()
    private rocks = new Map<string, any>()
    private sparkleEmitter: Emitter
    private clickEmitter: Emitter
    private foamEmitter: Emitter
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
    }

    private set = (state: GameState, zoneChanged: boolean) => {
        if (zoneChanged) {
            this.trees.clear()
            this.rocks.clear()
        }
        state.tiles.forEach((t: any) => {
            const i = t.x + ',' + t.y
            if (t.id === 5 && !this.trees.has(i)) {
                const scale = Math.random() * 5 + 2
                const transform = {
                    position: vec3.fromValues(TILE_SIZE * t.x, 0, TILE_SIZE * t.y),
                    scale: [scale + Math.random(), scale + Math.random(), scale + Math.random()],
                    rotation: [0, Math.random() * 360, 0],
                }
                vec3.add(transform.position, transform.position, [Math.random() * 8 - 4, 0, Math.random() * 8 - 4])
                transform.position[1] = 0
                this.trees.set(i, transform)
            } else if (t.id !== 5 && this.trees.has(i)) {
                this.trees.delete(i)
            }
            if (t.id === 6 && !this.rocks.has(i)) {
                const scale = Math.random() * 2 + 2
                const transform = {
                    position: vec3.fromValues(TILE_SIZE * t.x, 0, TILE_SIZE * t.y),
                    scale: [scale, scale, scale],
                    rotation: [0, Math.random() * 360, 0],
                }
                vec3.add(transform.position, transform.position, [Math.random() * 4 - 2, 0, Math.random() * 4 - 2])
                transform.position[1] = 0
                this.rocks.set(i, transform)
            } else if (t.id !== 6 && this.rocks.has(i)) {
                this.rocks.delete(i)
            }
        })
        this.engine.terrain.set(state.tiles, [state.mapMinX, state.mapMinY], [state.mapMaxX, state.mapMaxY])
    }

    private foamTimer = 0

    public tick(dt: number) {
        const gm = GameManager.instance
        if (this.engine.terrain.edges && this.foamTimer > 0.05) {
            const halfW = ((gm.state.mapMaxX - gm.state.mapMinX) / 2 + 64.5) * TILE_SIZE
            const halfH = ((gm.state.mapMaxY - gm.state.mapMinY) / 2 + 64.5) * TILE_SIZE
            this.foamEmitter.position[0] = (gm.state.mapMaxX + gm.state.mapMinX) * TILE_SIZE / 2
            this.foamEmitter.position[1] = -4
            this.foamEmitter.position[2] = (gm.state.mapMaxY + gm.state.mapMinY) * TILE_SIZE / 2
            this.foamEmitter.cube[0] = halfW
            this.foamEmitter.cube[2] = halfH
            this.foamEmitter.emit(100)
            this.foamTimer = 0
        }
        this.foamTimer += dt

        if (this.hover) {
            this.sparkleEmitter.position[1] = 0
            this.sparkleEmitter.emit(20)
        }
        this.hover = false

        this.engine.terrain.texture = gm.store.editor.enabled ?
            this.engine.resources.sprites.get('terrain-dev') :
            this.engine.resources.sprites.get('terrain')

        if (gm.store.editor.enabled || (gm.state.inCombat && gm.state.combat.casting)) {
            const position = vec3.fromValues(1, -TILE_SIZE_HALF, 1)
            for (let x = gm.state.mapMinX - 1; x <= gm.state.mapMaxX + 1; x++) {
                for (let y = gm.state.mapMinY - 1; y <= gm.state.mapMaxY + 1; y++) {
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
            this.trees.forEach((t) => {
                this.engine.v.drawMesh('tree', t, 'textured', 'colored')
            })
            this.rocks.forEach((t) => {
                this.engine.v.drawMesh('rocks', t, 'textured', 'colored')
            })
        }
    }

}
