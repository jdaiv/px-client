import { vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Entity from '../Entity'

export default class Player extends Entity {

    public velocity = vec3.create()
    public keysDown: Map<string, boolean>

    public init() {
        this.keysDown = new Map()

        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)
    }

    public destroy() {
        window.removeEventListener('keydown', this.keydown)
        window.removeEventListener('keyup', this.keyup)

        super.destroy()
    }

    public keydown = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, true)
        let direction: string
        switch (evt.code) {
        case 'KeyA':
            direction = 'W'
            break
        case 'KeyD':
            direction = 'E'
            break
        case 'KeyW':
            direction = 'S'
            break
        case 'KeyS':
            direction = 'N'
            break
        default:
            return
        }
        GameManager.instance.playerMove(direction)
    }

    public keyup = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, false)
    }

}
