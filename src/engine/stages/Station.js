import Stage from '../Stage'
import Player from '../entities/Player'
import EventManager from '../../services/EventManager'
import Services from '../../services'

const tileSize = 16

export default class Station extends Stage {

    data = null
    loading = true
    loadingRot = 0

    constructor (engine) {
        super(engine)

        this.addEntity(new Player('player'))

        this.data = {}
        this.map = []
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
                        ],
                        // rotation: [
                        //     0,
                        //     Math.floor(Math.random() * 4) * 90,
                        //     0,
                        // ]
                    })
                })
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
                if (p.id == this.data.player.id) {
                    this.engine.camera.target = [p.x * 16, 16, p.y * 16]
                }
            }
            this.engine.camera.offset = [0, 60, 120]
        }
    }

    draw (dt) {
        super.draw(dt)

        if (this.loading) {
            this.engine.v.drawSprite('loadingSign', {
                position: [0, Math.sin(this.loadingRot / 1000) * 4, 0],
                rotation: [0, this.loadingRot, 0],
                scale: 's'
            }, 'sprite', 0)
        } else {
            this.map.forEach((p, i) => {
                const transform = p
                this.engine.v.drawMesh('cube', transform, 'textured', p.type != 'default' ? p.type : 'grid')
            })
            for (let id in this.data.zone.players) {
                const p = this.data.zone.players[id]
                const x = p.x * 16
                const y = p.y * 16
                this.engine.v.drawSprite('poses', { position: [x, 0, y], scale: 's' }, 'sprite', 0)
                this.engine.v.drawSprite('faces', { position: [x, 16, y + 0.5], scale: 's' }, 'sprite', 1)
            }
            this.data.zone.entities.forEach(p => {
                const x = p.x * 16
                const y = p.y * 16
                const position = [x, 0, y]
                switch (p.type) {
                case 'sign':
                    this.engine.v.drawMesh('sign', { position }, 'outline', 'sign')
                    this.engine.v.drawMesh('sign', { position }, 'textured', 'sign')
                    break

                default:
                    this.engine.v.drawMesh('error', { position }, 'error')
                    break
                }
                if (p.usable) {
                    this.engine.overlay.add('ent' + p.id, position, p.name, () => {
                        Services.socket.send('game_action', {
                            type: 'use',
                            params: {
                                id: parseInt(p.id, 10)
                            }
                        })
                    })
                }
            })
        }
    }

}