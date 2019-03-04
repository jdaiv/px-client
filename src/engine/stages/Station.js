import Stage from '../Stage'
import Player from '../entities/Player'
import EventManager from '../../services/EventManager'
import { vec3 } from 'gl-matrix'
import Effects from './Effects'
import Tiles from './Tiles'
import EntityManager from '../entities/EntityManager'

export default class Station extends Stage {

    data = null
    loading = true
    loadingRot = 0
    particles = []

    shake = vec3.create()
    zero = vec3.create()

    debug = false

    constructor (engine) {
        super(engine)
        this.effects = new Effects(this, engine)
        this.tiles = new Tiles(engine)
        this.entityManager = new EntityManager(engine)

        this.addEntity(new Player('player'))

        this.data = {}
        this.playerPositions = new Map()
        EventManager.subscribe(
            'ws/game_state',
            'game',
            ({ data }) => {
                if (this.debug) return
                this.data = data
                this.loading = false
                this.tiles.set(data.zone)
                this.entityManager.set(data.player,
                    data.zone.players,
                    data.zone.entities,
                    data.zone.items)
                // this.debug = true
            })
        EventManager.subscribe('ws/play_effect', 'game', ({ data }) => {this.effects.handleEffect(data)})
    }

    tick (dt) {
        super.tick(dt)
        this.loadingRot += dt * 100
        if (this.loading) {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 0, 200])
        } else {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 60, 120])
        }

        this.entityManager.tick(dt)

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
            this.tiles.draw()
            this.entityManager.draw()
        }
    }

}