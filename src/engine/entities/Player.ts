import { quat, vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Engine from '../Engine'
import Entity from '../Entity'
import { TILE_SIZE } from '../Terrain'

export default class Player extends Entity {

    public velocity = vec3.create()
    public keysDown: Map<string, boolean>
    public rotation = 0
    public position = vec3.create()
    public rotationQ = quat.create()

    public init(engine: Engine) {
        super.init(engine)
        this.keysDown = new Map()

        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)
    }

    public destroy() {
        window.removeEventListener('keydown', this.keydown)
        window.removeEventListener('keyup', this.keyup)

        super.destroy()
    }

    public tick(dt: number) {
        const state = GameManager.instance.state
        const player = state.activePlayer
        if (player) {
            const pos = [player.x * TILE_SIZE, 16, player.y * TILE_SIZE]
            const rot = quat.fromEuler(quat.create(), 0, this.rotation * -90, 0)
            vec3.lerp(this.position, this.position, pos, dt * 10)
            quat.slerp(this.rotationQ, this.rotationQ, rot, dt * 10)
            this.engine.camera.setTarget(this.position)
            this.engine.camera.setOffset([0, 0, 0])
            this.engine.camera.setRotation(this.rotationQ)
            this.engine.camera.lookAt = false
        }
        super.tick(dt)
    }

    public keydown = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, true)
        let direction = -1
        switch (evt.code) {
        case 'KeyA':
            direction = 3
            break
        case 'KeyD':
            direction = 1
            break
        case 'KeyW':
            direction = 0
            break
        case 'KeyS':
            direction = 2
            break
        case 'KeyE':
            this.rotation = (this.rotation + 1) % 4
            break
        case 'KeyQ':
            this.rotation = (this.rotation - 1 + 4) % 4
            break
        }
        if (direction < 0) {
            return
        }
        GameManager.instance.playerMove(['N', 'W', 'S', 'E'][(direction + this.rotation) % 4])
    }

    public keyup = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, false)
    }

}
