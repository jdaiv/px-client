import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
import { TILE_SIZE_HALF } from '../rendering/Terrain'
import { DIRECTIONS } from './Player'
import { TILE_SIZE } from './Tiles'

const ZERO = vec3.create()
const ONE = vec3.fromValues(1, 1, 1)

export default class EntityManager {

    private engine: Engine
    private playerPositions: Map<number, any>
    private state: GameState

    constructor(engine: Engine) {
        this.state = GameManager.instance.state
        this.engine = engine
        this.playerPositions = new Map()
    }

    public tick(dt: number) {
        this.state.players.forEach((p, id) => {
            let pos = this.playerPositions.get(id)
            if (pos) {
                pos.target[0] = p.x * TILE_SIZE
                pos.target[2] = p.y * TILE_SIZE
            } else {
                pos = {
                    current: vec3.fromValues(p.x * TILE_SIZE, 0, p.y * TILE_SIZE),
                    target: vec3.fromValues(p.x * TILE_SIZE, 0, p.y * TILE_SIZE)
                }
                this.playerPositions.set(id, pos)
            }
            vec3.lerp(pos.current, pos.current, pos.target, dt * 20)

            // const nameTagPos = vec3.add(vec3.create(), pos.current, [0, 24, 0])
            // this.engine.overlay.setPlayerPos( p.id, nameTagPos)
        })
    }

    public draw() {
        this.drawPlayers()
        this.drawNPCs()
        this.drawEntities()
        this.drawItems()
    }

    public drawPlayers() {
        const rotation = ZERO
        const aP = this.state.activePlayer
        const aPD = DIRECTIONS.indexOf(aP.facing)
        this.state.players.forEach((p, id) => {
            if (id === aP.id) return
            const pPos = this.playerPositions.get(id)
            if (!pPos) return
            const pos = vec3.clone(pPos.current)
            pos[1] = 16
            const relativeDir = (DIRECTIONS.indexOf(p.facing) - aPD + 4) % 4
            const offset = vec3.fromValues(
                relativeDir % 2 ? 0 : (relativeDir === 0 ? -1 : 1),
                0,
                relativeDir > 0 ? 0.5 : -0.5
            )
            vec3.rotateY(offset, offset, [0, 0, 0],
                (this.engine.v.rotateCamera[1]) * Math.PI / 180)
            offset[0] *= -1
            // console.log(offset)
            vec3.add(pos, pos, offset)
            const hasSunglasses = p.slots.head && p.slots.head.type !== 'empty'
            const scaleX = relativeDir > 1 ? 1 : -1
            const scale = [relativeDir % 2 === 1 ? -scaleX : scaleX, 1, 1]
            let frame = 0
            if (vec3.distance(pPos.current, pPos.target) > 1) {
                pos[1] = 15
                frame = 1
            }
            this.engine.v.drawSprite('poses', { position: pPos.current, rotation, scale }, 'sprite', frame)
            this.engine.v.drawSprite('faces',
                { position: pos, rotation, scale }, 'sprite', hasSunglasses ? 4 : 0)
        })
    }

    public drawNPCs() {
        const rotation = ZERO
        const p = this.state.activePlayer
        this.state.npcs.forEach((n, id) => {
            const position = [n.x * TILE_SIZE, 0, n.y * TILE_SIZE]
            this.engine.v.drawSprite('skeleton',
                { position, rotation },
                'sprite', Math.floor(this.engine.time / 1000) % 2)
            if (Math.abs(n.x - p.x) <= 1 && Math.abs(n.y - p.y) <= 1) {
                const aabb = {
                    min: vec3.sub(vec3.create(), position,
                        [TILE_SIZE_HALF, TILE_SIZE * 2, TILE_SIZE_HALF]),
                    max: vec3.add(vec3.create(), position,
                        [TILE_SIZE_HALF, TILE_SIZE * 2, TILE_SIZE_HALF])
                }
                this.engine.interactions.addItem(
                    aabb,
                    () => {
                        this.engine.overlay.aabb = aabb
                        this.engine.overlay.text = 'attack ' + n.name
                    },
                    () => {
                        GameManager.instance.playerAttack(id)
                    }
                )
            }
        })
    }

    public drawEntities() {
        const transform = {
            position: vec3.fromValues(0 * TILE_SIZE, 0, 0 * TILE_SIZE),
            scale: ONE,
            rotation: ZERO
        }
        const editor = GameManager.instance.store.editor

        const p = this.state.activePlayer

        this.state.entities.forEach((e, id) => {
            transform.position[0] = e.x * TILE_SIZE
            transform.position[1] = 0
            transform.position[2] = e.y * TILE_SIZE
            transform.rotation[1] = e.rotation
            if (editor.enabled && editor.mode === 'entity') {
                this.engine.interactions.addItem(
                    {
                        min: vec3.sub(vec3.create(), transform.position,
                            [TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF]),
                        max: vec3.add(vec3.create(), transform.position,
                            [TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF])
                    },
                    () => {
                        console.log(e)
                        editor.selectedEntity = id
                    }
                )
            } else if (e.usable && Math.abs(e.x - p.x) <= 1 && Math.abs(e.y - p.y) <= 1) {
                const aabb = {
                    min: vec3.sub(vec3.create(), transform.position,
                        [TILE_SIZE_HALF / 2, -TILE_SIZE_HALF, TILE_SIZE_HALF / 2]),
                    max: vec3.add(vec3.create(), transform.position,
                        [TILE_SIZE_HALF / 2, TILE_SIZE, TILE_SIZE_HALF / 2])
                }
                this.engine.interactions.addItem(
                    aabb,
                    () => {
                        this.engine.overlay.aabb = aabb
                        this.engine.overlay.text = e.useText + ' ' + e.name
                        if (e.type !== 'dummy') this.engine.stage.player.use = true
                    },
                    () => {
                        GameManager.instance.playerUse(id)
                    }
                )
            }
            switch (e.type) {
            case 'door':
                transform.position[1] = 12
                this.engine.v.drawSprite('station-door', transform, 'sprite', 0)
                break
            case 'corpse':
                switch (e.fields.type) {
                case 'player':
                    this.engine.v.drawSprite('poses', transform, 'sprite', 7)
                    break
                case 'blob':
                    this.engine.v.drawSprite('skeleton', transform, 'sprite', 2)
                    break
                }
                break
            case 'item_spawner':
                // this.engine.v.drawMesh(e.type, transform, 'outline', 'colored')
                this.engine.v.drawMesh(e.type, transform, 'textured', 'colored')
                break
            case 'npc_spawner':
            case 'item_modifier':
                // this.engine.v.drawMesh('button', transform, 'outline', 'colored')
                this.engine.v.drawMesh('button', transform, 'textured', 'colored')
                break
            case 'house':
                transform.position[0] -= TILE_SIZE / 2
                transform.position[2] -= TILE_SIZE / 2
            default:
                // this.engine.v.drawMesh(e.type, transform, 'outline', e.type)
                this.engine.v.drawMesh(e.type, transform, 'textured', e.type)
                break
            }
        })
    }

    public drawItems() {
        const p = this.state.activePlayer
        this.state.items.forEach((i, id) => {
            const transform = {
                position: [i.x * TILE_SIZE, 4, i.y * TILE_SIZE],
                scale: [0.5, 0.5, 0.5],
                rotation: ZERO
            }
            this.engine.v.drawSprite('item-bag', transform, 'sprite', 0)
            if (Math.abs(i.x - p.x) <= 1 && Math.abs(i.y - p.y) <= 1) {
                const aabb = {
                    min: vec3.sub(vec3.create(), transform.position,
                        [TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF]),
                    max: vec3.add(vec3.create(), transform.position,
                        [TILE_SIZE_HALF, TILE_SIZE_HALF, TILE_SIZE_HALF])
                }
                this.engine.interactions.addItem(
                    aabb,
                    () => {
                        this.engine.overlay.aabb = aabb
                        this.engine.overlay.text = 'take ' + i.name
                    },
                    () => {
                        GameManager.instance.playerTakeItem(id)
                    }
                )
            }
        })
    }

}
