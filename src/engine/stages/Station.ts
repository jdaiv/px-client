import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Engine from '../Engine'
import EntityManager from '../entities/EntityManager'
import Player from '../entities/Player'
import Stage from '../Stage'
import Effects from './Effects'
import Tiles from './Tiles'

export default class Station extends Stage {

    public data = null
    public loading = true
    public loadingRot = 0

    public shake = vec3.create()
    public zero = vec3.create()

    public debug = false

    private effects: Effects
    private tiles: Tiles
    private entityManager: EntityManager

    public playerPositions: Map<string, vec3>

    constructor(engine: Engine) {
        super(engine)
        this.effects = new Effects(this, engine)
        this.tiles = new Tiles(engine)
        this.entityManager = new EntityManager(engine)
        this.particles = []

        this.addEntity(new Player('player'))

        this.data = {}
        this.playerPositions = new Map()
        GameManager.instance.state.registerListener((state) => {
            this.loading = !state.valid
        })
        GameManager.instance.onEffect = this.effects.handleEffect
    }

    public tick(dt: number) {
        super.tick(dt)
        this.loadingRot += dt * 100
        if (this.loading) {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 0, 200])
        } else {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 60, 120])
        }

        this.tiles.tick(dt)
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

    public draw(dt: number) {
        super.draw(dt)

        if (this.loading) {
            this.engine.v.drawSprite('loading', {
                position: [0, Math.sin(this.loadingRot / 1000) * 4, 0],
                rotation: [0, this.loadingRot, Math.sin(this.loadingRot / 80) * 8],
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
