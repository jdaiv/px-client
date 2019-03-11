import { vec3 } from 'gl-matrix'

import Services from '../../services'
import Entity from '../Entity'

export default class Player extends Entity {

    public velocity = vec3.create()
    public keysDown: Map<string, boolean>

    public init() {
        // this.body = this.addComponent('body', new Sprite3D('poses'))
        // this.body.frame = 0
        // this.face = this.addComponent('face', new Sprite3D('faces', 0, 0, 0.5))
        // this.face.frame = 4
        // this.faceTimer = 0

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
        this.keysDown.forEach((v, k) => {
            if (!v) return

        })
    }

    public keydown = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, true)
        let direction
        switch (evt.code) {
        case 'ArrowLeft':
            direction = 'W'
            break
        case 'ArrowRight':
            direction = 'E'
            break
        case 'ArrowUp':
            direction = 'S'
            break
        case 'ArrowDown':
            direction = 'N'
            break
        default:
            return
        }
        Services.socket.send('game_action', {
            type: 'move',
            params: {
                direction
            }
        })
    }

    public keyup = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, false)
    }

}