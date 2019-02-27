import Stage from '../Stage'
import Player from '../entities/Player'
import EventManager from '../../services/EventManager'
import Services from '../../services'
import { vec3, vec2 } from 'gl-matrix'

const tileSize = 16

function rand (range) {
    return Math.random() * range * 2 - range
}
function randN (range) {
    return Math.random() * range
}

export default class Station extends Stage {

    data = null
    loading = true
    loadingRot = 0
    particles = []

    constructor (engine) {
        super(engine)

        this.addEntity(new Player('player'))

        this.data = {}
        this.map = []
        this.playerPositions = new Map()
        EventManager.subscribe(
            'ws/game_state',
            'game',
            ({ data }) => {
                this.data = data
                this.loading = false
                this.map.length = 0
                data.zone.map.forEach((t, i) => {
                    this.map.push({
                        type: t.type,
                        position: [
                            Math.floor(i % data.zone.width) * tileSize,
                            -tileSize / 2,
                            Math.floor(i / data.zone.width) * tileSize,
                        ]
                    })
                })
            })
        EventManager.subscribe(
            'ws/play_effect',
            'game',
            ({ data }) => {
                for (let i = 0; i < 20; i++) {
                    this.particles.push({
                        position: vec3.fromValues(data.x * tileSize, 8, data.y * tileSize),
                        rotation: vec3.fromValues(rand(180), rand(180), rand(180)),
                        positionV: vec3.fromValues(rand(20), randN(100) + 50, rand(20)),
                        rotationV: vec3.fromValues(rand(180), rand(180), rand(180)),
                        scale: vec3.fromValues(0.25, 0.25, 0.25),
                        active: true
                    })
                }
            })
    }

    tick (dt) {
        super.tick(dt)
        this.loadingRot += dt * 100
        if (this.loading) {
            this.engine.camera.target = [0, 0, 0]
            this.engine.camera.offset = [0, 0, 200]
        } else {
            this.engine.camera.target = [0, 0, 0]
            for (let id in this.data.zone.players) {
                const p = this.data.zone.players[id]
                let pos = this.playerPositions.get(id)
                if (pos) {
                    pos.target[0] = p.x * tileSize
                    pos.target[2] = p.y * tileSize
                } else {
                    pos = {
                        current: vec3.fromValues(p.x * tileSize, 0, p.y * tileSize),
                        target: vec3.fromValues(p.x * tileSize, 0, p.y * tileSize)
                    }
                    this.playerPositions.set(id, pos)
                }
                vec3.lerp(pos.current, pos.current, pos.target, dt * 20)
                if (this.data.player.id == id) {
                    this.engine.camera.target = [pos.current[0], 16, pos.current[2]]
                }

                const nameTagPos = vec3.add(vec3.create(), pos.current, [0, 24, 0])
                this.engine.overlay.add('ent' + p.id, nameTagPos, p.name)
            }

            this.playerPositions
            this.engine.camera.offset = [0, 60, 120]
        }

        this.particles.forEach(p => {
            p.positionV[1] -= 200 * dt
            vec3.scaleAndAdd(p.position, p.position, p.positionV, dt)
            vec3.scaleAndAdd(p.rotation, p.rotation, p.rotationV, dt)
            if (p.position[1] < 0) {
                p.position[1] = 0
                vec3.multiply(p.positionV, p.positionV, [0.5, -0.5, 0.5])
            }
            if (p.position[1] < 5 && vec3.length(p.positionV) < 10) {
                p.active = false
            }
        })
    }

    draw (dt) {
        super.draw(dt)

        if (this.loading) {
            this.engine.v.drawSprite('loadingSign', {
                position: [0, Math.sin(this.loadingRot / 1000) * 4, 0],
                rotation: [0, this.loadingRot, Math.sin(this.loadingRot / 80) * 8],
                scale: 's'
            }, 'sprite', 0)
        } else {
            this.particles.forEach((p, i) => {
                if (p.active) this.engine.v.drawMesh('error', p, 'error', 'missing')
            })
            this.map.forEach((p, i) => {
                const transform = p
                this.engine.v.drawMesh('cube', transform, 'textured', p.type != 'default' ? p.type : 'grid')
            })
            for (let id in this.data.zone.players) {
                const p = this.playerPositions.get(id)
                if (!p) continue
                const x = p.current[0]
                const y = p.current[2]
                if (vec3.distance(p.current, p.target) > 1) {
                    this.engine.v.drawSprite('poses', { position: p.current, scale: 's' }, 'sprite', 1)
                    this.engine.v.drawSprite('faces', { position: [x, 15, y + 0.5], scale: 's' }, 'sprite', 1)
                } else {
                    this.engine.v.drawSprite('poses', { position: p.current, scale: 's' }, 'sprite', 0)
                    this.engine.v.drawSprite('faces', { position: [x, 16, y + 0.5], scale: 's' }, 'sprite', 1)
                }
            }
            const player = this.data.zone.players[this.data.player.id]
            this.data.zone.entities.forEach(p => {
                const x = p.x * 16
                const y = p.y * 16
                const position = [x, 0, y]
                const usePosition = [x, 0, y]
                switch (p.type) {
                case 'sign':
                case 'dummy':
                    this.engine.v.drawMesh(p.type, { position }, 'outline', p.type)
                    this.engine.v.drawMesh(p.type, { position }, 'textured', p.type)
                    usePosition[1] = 8
                    break
                case 'item_bag':
                    // usePosition[1] = 8
                    position[1] = 4
                    this.engine.v.drawSprite('itemBag', { position, scale: [0.5, 0.5, 0.5] }, 'sprite')
                    break
                case 'door':
                    usePosition[1] = 12
                    position[1] = 12
                    this.engine.v.drawSprite('door', { position, scale: 's' }, 'sprite')
                    break
                default:
                    this.engine.v.drawMesh('error', { position }, 'error')
                    break
                }
                if (p.usable && Math.abs(player.x - p.x) <= 1 && Math.abs(player.y - p.y) <= 1) {
                    this.engine.overlay.add('ent' + p.id, usePosition, p.name, () => {
                        Services.socket.send('game_action', {
                            type: 'use',
                            params: {
                                id: parseInt(p.id, 10)
                            }
                        })
                    }, p.useText)
                }
            })
        }
    }

}