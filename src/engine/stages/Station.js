import Stage from '../Stage'
import Player from '../entities/Player'
import Services from '../../services'
import EventManager from '../../services/EventManager'

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
                            Math.floor(i / data.zone.height) * tileSize,
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
            for (let id in this.data.zone.entities) {
                const p = this.data.zone.entities[id]
                if (p.id == this.data.player.id) {
                    this.engine.camera.target = [p.x * 16, 16, p.y * 16]
                }
            }
            // this.engine.camera.offset = [0, 120, 240]
            this.engine.camera.offset = [0, 60, 120]
            // this.engine.camera.fov = 50 + Math.sin(this.loadingRot / 200) * 20
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
                // const transform = {
                //     ...p,
                //     scale: [0.8, 0.8, 0.8],
                //     rotation: [0, this.loadingRot + i * 20, this.loadingRot + i * 20]
                // }
                const transform = p
                this.engine.v.drawMesh('cube', transform, 'textured', p.type == 'grass' ? p.type : 'grid')
                // this.engine.v.drawMesh('cube', transform, 'outline', 'grid')
            })
            for (let id in this.data.zone.entities) {
                const p = this.data.zone.entities[id]
                const x = p.x * 16
                const y = p.y * 16
                this.engine.v.drawSprite('poses', { position: [x, 0, y], scale: 's' }, 'sprite', 0)
            }
        }
    }

}