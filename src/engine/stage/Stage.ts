import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Engine from '../Engine'
import Effects from './Effects'
import EntityManager from './EntityManager'
import Player from './Player'
import Tiles from './Tiles'

export default class Stage {

    public data = null
    public loading = true
    public loadingRot = 0

    public shake = vec3.create()
    public zero = vec3.create()

    public debug = false

    public effects: Effects
    private tiles: Tiles
    private entityManager: EntityManager
    private player: Player
    private engine: Engine

    public playerPositions: Map<string, vec3>

    constructor(engine: Engine) {
        this.engine = engine
        this.effects = new Effects(engine)
        this.tiles = new Tiles(engine)
        this.entityManager = new EntityManager(engine)

        this.player = new Player(engine)

        this.data = {}
        this.playerPositions = new Map()
        GameManager.instance.state.registerListener((state) => {
            this.player.direction = state.activePlayer.facing
            this.loading = !state.valid
        })
        GameManager.instance.onEffect = this.effects.handleEffect
    }

    public tick(dt: number) {
        this.loadingRot += dt * 100

        if (this.loading) {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 0, 100])
            this.engine.camera.lookAt = true
        }

        this.tiles.tick(dt)
        this.entityManager.tick(dt)
        this.effects.tick()
        this.player.tick(dt)
    }

    public draw() {
        if (this.loading) {
            this.engine.v.drawSpriteR('loading', {
                position: [0, Math.sin(this.loadingRot / 1000) * 4, 0],
                rotation: [0, this.loadingRot, Math.sin(this.loadingRot / 80) * 8],
            }, 'sprite', 0)
        } else {
            this.tiles.draw()
            this.entityManager.draw()
        }
    }

}
