import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import GameState from '../../shared/GameState'
import Engine from '../Engine'
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

            const nameTagPos = vec3.add(vec3.create(), pos.current, [0, 24, 0])
            this.engine.overlay.setPlayerPos( p.id, nameTagPos)
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
            const pos = this.playerPositions.get(id)
            if (!pos) return
            const x = pos.current[0]
            const y = pos.current[2]
            const relativeDir = (DIRECTIONS.indexOf(p.facing) - aPD + 4) % 4
            // console.log(DIRECTIONS.indexOf(p.facing), aPD, relativeDir)
            const offsetS = relativeDir === 2 ? -1 : 0
            const offsetX = aPD % 2 === 1 ? (aPD > 1 || relativeDir === 0 ? -0.5 : 0.5) : offsetS
            const offsetZ = aPD % 2 === 0 ? (aPD > 1 || relativeDir === 0 ? 0.5 : -0.5) : offsetS
            const hasSunglasses = p.slots.head && p.slots.head.type !== 'empty'
            const scaleX = relativeDir > 1 ? 1 : -1
            const scale = [relativeDir % 2 === 1 ? -scaleX : scaleX, 1, 1]
            if (vec3.distance(pos.current, pos.target) > 1) {
                this.engine.v.drawSprite('poses', { position: pos.current, rotation, scale }, 'sprite', 1)
                this.engine.v.drawSprite('faces',
                    { position: [x + offsetX, 15, y + offsetZ], rotation, scale }, 'sprite', hasSunglasses ? 4 : 0)
            } else {
                this.engine.v.drawSprite('poses', { position: pos.current, rotation, scale }, 'sprite', 0)
                this.engine.v.drawSprite('faces',
                    { position: [x + offsetX, 16, y + offsetZ], rotation, scale }, 'sprite', hasSunglasses ? 4 : 0)
            }
        })
    }

    public drawNPCs() {
        const rotation = ZERO
        this.state.npcs.forEach((p, id) => {
            this.engine.v.drawSprite('blob',
                { position: [p.x * TILE_SIZE, 0, p.y * TILE_SIZE], rotation },
                'sprite', Math.floor(this.engine.time / 1000) % 2)
        })
    }

    public drawEntities() {
        const transform = {
            position: vec3.fromValues(0 * TILE_SIZE, 0, 0 * TILE_SIZE),
            scale: ONE,
            rotation: ZERO
        }
        const editor = GameManager.instance.store.editor

        this.state.entities.forEach((e, id) => {
            let mouseData = null
            if (editor.enabled && editor.mode === 'entity') {
                mouseData = {
                    draw: true,
                    callback: (type: string) => {
                        if (type === 'click') {
                            console.log(e)
                            editor.selectedEntity = id
                        }
                    }
                }
            }

            transform.position[0] = e.x * TILE_SIZE
            transform.position[1] = 0
            transform.position[2] = e.y * TILE_SIZE
            switch (e.type) {
            case 'house':
                transform.position[0] -= TILE_SIZE / 2
                transform.position[2] -= TILE_SIZE / 2
            case 'sign':
            case 'dummy':
                this.engine.v.drawMesh(e.type, transform, 'outline', e.type)
                this.engine.v.drawMesh(e.type, transform, 'textured', e.type, mouseData)
                break
            case 'door':
                transform.position[1] = 12
                this.engine.v.drawSprite('station-door', transform, 'sprite', 0, mouseData)
                break
            case 'corpse':
                switch (e.fields.type) {
                case 'player':
                    this.engine.v.drawSprite('poses', transform, 'sprite', 7, mouseData)
                    break
                case 'blob':
                    this.engine.v.drawSprite('blob', transform, 'sprite', 2, mouseData)
                    break
                }
                break
            default:
                this.engine.v.drawMesh('error', transform, 'error', null, mouseData)
                break
            }
        })
    }

    public drawItems() {
        this.state.items.forEach((i, id) => {
            const transform = {
                position: [i.x * TILE_SIZE, 4, i.y * TILE_SIZE],
                scale: [0.5, 0.5, 0.5],
                rotation: ZERO
            }
            this.engine.v.drawMesh('quad', transform, 'sprite', 'item-bag')
        })
    }

}
