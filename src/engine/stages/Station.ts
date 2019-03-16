import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Engine from '../Engine'
import EntityManager from '../entities/EntityManager'
import Player from '../entities/Player'
import { Emitter } from '../Particles'
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

    public effects: Effects
    private tiles: Tiles
    private entityManager: EntityManager

    public playerPositions: Map<string, vec3>

    private loadingEmitter: Emitter

    constructor(engine: Engine) {
        super(engine)
        this.effects = new Effects(engine)
        this.tiles = new Tiles(engine)
        this.entityManager = new EntityManager(engine)

        this.addEntity(new Player('player'))

        this.data = {}
        this.playerPositions = new Map()
        GameManager.instance.state.registerListener((state) => {
            this.loading = !state.valid
        })
        GameManager.instance.onEffect = this.effects.handleEffect

        this.loadingEmitter = engine.particles.newEmitter({
            dampening: vec3.fromValues(0.9, 0.9, 0.9),
            gravity: vec3.fromValues(0, 50, 0),
            size: [0.5, 1],
            velocity: [0, 0],
            lifetime: [1, 2],
            color: [0, 255, 0, 255],
            shape: 'square',
            cube: vec3.fromValues(10, 16, 64),
            rotation: vec3.fromValues(0, 0, 0),
            outline: true,
            spread: 0.4,
        })
    }

    public tick(dt: number) {
        super.tick(dt)
        this.loadingRot += dt * 100

        if (this.loading) {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 0, 200])
            this.loadingEmitter.position = vec3.fromValues(0, Math.sin(this.loadingRot / 1000) * 4, 0)
            this.loadingEmitter.rotation = vec3.fromValues(0, this.loadingRot + 90, Math.sin(this.loadingRot / 80) * 8)
            this.loadingEmitter.emit(100)
        } else {
            this.engine.camera.setTarget([0, 0, 0])
            this.engine.camera.setOffset([0, 60, 120])
        }

        this.tiles.tick(dt)
        this.entityManager.tick(dt)
        this.effects.tick()
    }

    public draw(dt: number) {
        super.draw(dt)

        if (this.loading) {
            this.engine.v.drawSprite('loading', {
                position: [0, Math.sin(this.loadingRot / 1000) * 4, 0],
                rotation: [0, this.loadingRot, Math.sin(this.loadingRot / 80) * 8],
            }, 'sprite', 0)
        } else {
            this.tiles.draw()
            this.entityManager.draw()
        }
    }

}
