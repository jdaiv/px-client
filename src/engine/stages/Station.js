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
                data.Map.forEach((t, i) => {
                    this.map.push({
                        position: [
                            Math.floor(i % data.Width) * tileSize,
                            -tileSize / 2 + (t.Type == 'grass' ? 1 : 0),
                            Math.floor(i / data.Width) * tileSize,
                        ]
                    })
                })
            })
    }

    tick (dt) {
        super.tick(dt)
        if (this.loading) {
            this.loadingRot += dt * 100
            this.engine.camera.target = [0, 0, 0]
            this.engine.camera.offset = [0, 0, 300]
        } else {
            this.engine.camera.target = [0, 0, 0]
            this.engine.camera.offset = [0, 120, 360]
        }
    }

    draw (dt) {
        super.draw(dt)

        if (this.loading) {
            this.engine.v.drawSprite('loadingSign', {
                position: [0, 0, 0],
                rotation: [0, this.loadingRot, 0],
                scale: 's'
            }, 'sprite', 0)
        } else {
            this.map.forEach((p) => {
                this.engine.v.drawMesh('cube', p, 'textured', 'grid')
            })
            for (let id in this.data.Players) {
                const p = this.data.Players[id]
                const x = p.X * 16
                const y = p.Y * 16
                this.engine.v.drawSprite('poses', { position: [x, 0, y], scale: 's' }, 'sprite', 0)
            }
        }
    }

}