import Stage from '../Stage'
import Entity from '../Entity'
import Resources from '../Resources'
import { Vector3 } from '../Vector'
import Player from '../entities/Player'
import Sprite3D from '../components/Sprite3D'
import Volume3D from '../components/Volume3D'
import { platform } from '../volumes/Station'

export default class Station extends Stage {

    constructor (engine) {
        super(engine)

        this.building = this.makeSprite('building', 'stationBuilding')
        this.building.position = new Vector3(0, 0, 5)
        this.fence = this.makeSprite('fence', 'stationFence')
        this.fence.position = new Vector3(0, 0, 0)
        this.edge = this.makeVolume('edge', platform)
        this.edge.position = new Vector3(-128, 0, 0)

        this.player = this.addEntity(new Player('player'))
        this.player.position.x = 6
        this.player.position.y = 4
        this.player.position.z = 4

        this.tracks = []
        for (let i = 0; i <= 120; i++) {
            let track = this.makeSprite('track' + i, 'stationTrack')
            track.position = new Vector3((i - 60) * 10, -30, 50)
            this.tracks[i] = track
        }
    }

    makeSprite (name, imgName) {
        const ent = new Entity('building')
        ent.addComponent(new Sprite3D(Resources.images[imgName]))
        this.addEntity(ent)
        return ent
    }

    makeVolume (name, volume) {
        const ent = new Entity('building')
        ent.addComponent(new Volume3D(volume))
        this.addEntity(ent)
        return ent
    }

    tick (dt) {
        super.tick(dt)
        // this.building.position.z = Math.sin(this.engine.time/ 1000) * 10
        this.tracks.forEach((t, i) => {
            // t.position.x = ((i - 60) * Math.sin(this.engine.time / 1000)) * 15
            t.position.y = -40 + Math.round(Math.sin(this.engine.time / 100 + i) * 1)
        })
    }

    draw (dt) {
        super.draw(dt)
    }

}