import Stage from '../Stage'
import Player from '../entities/Player'
import Services from '../../services'

const tileSize = 16

export default class Station extends Stage {

    data = null

    constructor (engine) {
        super(engine)

        this.addEntity(new Player('player'))

        this.data = []
        Services.getGameState().then(data => {
            data.Map.forEach((t, i) => {
                this.data.push({
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
    }

    draw (dt) {
        super.draw(dt)

        if (this.data) {
            this.data.forEach((p) => {
                this.engine.v.drawMesh('cube', p, 'textured', 'grid')
            })
        }

        this.engine.v.drawMesh('arcadecab', { position: [32, 0, -16] }, 'outline', 'arcadecab')
        this.engine.v.drawMesh('arcadecab', { position: [32, 0, -16] }, 'textured', 'arcadecab')
    }

}