import Services from '../../services'
import { TILE_SIZE } from '../stages/Tiles'
import { vec3 } from 'gl-matrix'

const ZERO = vec3.create()
const ONE = vec3.fromValues(1, 1, 1)

export default class EntityManager {

    constructor (engine) {
        this.engine = engine
        this.entities = new Map()
        this.players = new Map()
        this.playerPositions = new Map()
        this.items = new Map()
        this.npcs = new Map()
        this.activePlayer = null
    }

    set (activePlayer, players, ents, items, npcs) {
        this.activePlayer = activePlayer
        this.players.clear()
        this.entities.clear()
        this.items.clear()
        this.npcs.clear()
        for (let id in players) {
            this.players.set(id, players[id])
        }
        ents.forEach(e => {
            this.entities.set(e.id, e)
        })
        for (let id in items) {
            this.items.set(id, items[id])
        }
        for (let id in npcs) {
            this.npcs.set(id, npcs[id])
        }
    }

    tick (dt) {
        this.players.forEach((p, id) => {
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
            if (this.activePlayer && this.activePlayer.id == id) {
                this.engine.camera.setTarget([pos.current[0], 16, pos.current[2]])
            }

            const nameTagPos = vec3.add(vec3.create(), pos.current, [0, 24, 0])
            this.engine.overlay.setPlayerPos( p.id, nameTagPos)
        })

        // pos[1] = 0
        // this.items.forEach((i, id) => {
        //     pos[0] = i.x * TILE_SIZE
        //     pos[2] = i.y * TILE_SIZE
        //     if (Math.abs(player.x - i.x) <= 1 && Math.abs(player.y - i.y) <= 1) {
        //         this.engine.overlay.add('item' + i.id, pos, i.name, () => {
        //             Services.socket.send('game_action', {
        //                 type: 'take_item',
        //                 params: {
        //                     id: i.id
        //                 }
        //             })
        //         }, 'take')
        //     }
        // })
    }

    draw () {
        this.drawPlayers()
        this.drawNPCs()
        this.drawEntities()
        this.drawItems()
    }

    drawPlayers () {
        const rotation = ZERO
        this.players.forEach((p, id) => {
            const pos = this.playerPositions.get(id)
            if (!pos) return
            const x = pos.current[0]
            const y = pos.current[2]
            const hasSunglasses = p.slots.head && p.slots.head.type != 'empty'
            if (vec3.distance(pos.current, pos.target) > 1) {
                this.engine.v.drawSprite('poses', { position: pos.current, rotation }, 'sprite', 1)
                this.engine.v.drawSprite('faces', { position: [x, 15, y + 0.5], rotation }, 'sprite', hasSunglasses ? 4 : 1)
            } else {
                this.engine.v.drawSprite('poses', { position: pos.current, rotation }, 'sprite', 0)
                this.engine.v.drawSprite('faces', { position: [x, 16, y + 0.5], rotation }, 'sprite', hasSunglasses ? 4 : 1)
            }
        })
    }

    drawNPCs () {
        const rotation = ZERO
        this.npcs.forEach((p, id) => {
            this.engine.v.drawSprite('blob',
                { position: [p.x * TILE_SIZE, 0, p.y * TILE_SIZE], rotation },
                'sprite', Math.floor(this.engine.time / 1000) % 2)
        })
    }

    drawEntities () {
        this.entities.forEach((e, id) => {
            const transform = {
                position: [e.x * TILE_SIZE, 0, e.y * TILE_SIZE],
                scale: ONE,
                rotation: ZERO
            }
            switch (e.type) {
            case 'sign':
            case 'dummy':
                this.engine.v.drawMesh(e.type, transform, 'outline', e.type)
                this.engine.v.drawMesh(e.type, transform, 'textured', e.type)
                break
            case 'item_bag':
                transform.position[1] = 4
                transform.scale = [0.5, 0.5, 0.5]
                this.engine.v.drawMesh('quad', transform, 'sprite', 'itemBag')
                break
            case 'door':
                transform.position[1] = 12
                this.engine.v.drawSprite('door', transform, 'sprite')
                break
            case 'corpse':
                this.engine.v.drawSprite('poses', transform, 'sprite', 7)
                break
            default:
                this.engine.v.drawMesh('error', transform, 'error')
                break
            }
        })
    }

    drawItems () {
        this.items.forEach((i, id) => {
            const transform = {
                position: [i.x * TILE_SIZE, 4, i.y * TILE_SIZE],
                scale: [0.5, 0.5, 0.5],
                rotation: ZERO
            }
            this.engine.v.drawMesh('quad', transform, 'sprite', 'itemBag')
        })
    }

}