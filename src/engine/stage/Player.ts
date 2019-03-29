import { quat, vec3 } from 'gl-matrix'
import GameManager from '../../shared/GameManager'
import Engine from '../Engine'
import { TILE_SIZE } from '../rendering/Terrain'

export const DIRECTIONS = ['N', 'W', 'S', 'E']

function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
}

export default class Player {

    private engine: Engine
    public velocity = vec3.create()
    public keysDown: Map<string, boolean>
    public rotation = 0
    public rotationChange = 0
    public position = vec3.create()
    public rotationQ = quat.create()
    public walkAmp = 0
    public weaponPos = vec3.create()
    public swordAttack = 0
    private t = 0

    public get direction(): string {
        return DIRECTIONS[this.rotation % 4]
    }

    public set direction(d: string) {
        this.rotation = DIRECTIONS.indexOf(d)
    }

    constructor(engine: Engine) {
        this.engine = engine
        this.keysDown = new Map()

        window.addEventListener('keydown', this.keydown)
        window.addEventListener('keyup', this.keyup)
    }

    public destroy() {
        window.removeEventListener('keydown', this.keydown)
        window.removeEventListener('keyup', this.keyup)
    }

    public tick(dt: number) {
        const player = GameManager.instance.state.activePlayer
        if (player && !GameManager.instance.store.editor.enabled) {
            const pos = [player.x * TILE_SIZE, 16, player.y * TILE_SIZE]
            const rotY = (this.rotation * 90 + 180)
            const rot = quat.fromEuler(quat.create(), 0, rotY, 0)
            this.walkAmp = lerp(this.walkAmp, vec3.dist(pos, this.position) > 0.5 ? 1 : 0, dt * 10)
            vec3.lerp(this.position, this.position, pos, dt * 10)
            quat.slerp(this.rotationQ, this.rotationQ, rot, dt * 10)
            this.engine.camera.setTarget(this.position)
            this.engine.camera.setOffset([0, 0, 0])
            this.engine.camera.setRotation(this.rotationQ)
            this.engine.camera.lookAt = false
            // vec3.set(this.engine.camera.offset,
            //     0,
            //     Math.sin(this.t * 8) * this.walkAmp,
            //     0
            // )
        } else if (GameManager.instance.store.editor.enabled) {
            this.rotation = 2
            const pos = [player.x * TILE_SIZE, 100, player.y * TILE_SIZE]
            const rot = quat.fromEuler(quat.create(), 90, 0, 0)
            vec3.lerp(this.position, this.position, pos, dt * 10)
            quat.slerp(this.rotationQ, this.rotationQ, rot, dt * 10)
            this.engine.camera.setTarget(this.position)
            this.engine.camera.setRotation(this.rotationQ)
            this.engine.camera.lookAt = false
        }
        this.rotationChange = lerp(this.rotationChange, 0, dt * 10)
        const targetPos = vec3.fromValues(
            Math.cos(this.t * 4) * this.walkAmp + this.engine.v.mouseDeltaX * -1,
            Math.sin(this.t * 8) * this.walkAmp + this.engine.v.mouseDeltaY,
            Math.cos(this.t * 1) * this.walkAmp
        )
        this.weaponPos = vec3.lerp(this.weaponPos, this.weaponPos, targetPos, dt * 10)
        this.t += dt
        this.swordAttack -= dt

        const newRotation = Math.floor((this.engine.v.rotateCamera[1] + 270 - 45) % 360 / 90)
        if (newRotation !== this.rotation) {
            this.rotation = newRotation
            GameManager.instance.playerSetFacing(this.direction)
        }
    }

    public draw() {
        const transform = {
            position: this.weaponPos,
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        }
        this.engine.v.drawModelUIAnimated('sword_animated', transform, 'outline', 'colored',
            this.swordAttack > 0 ? 'Attack' : 'Hold', 2 - this.swordAttack)
        this.engine.v.drawModelUIAnimated('sword_animated', transform, 'textured', 'colored',
            this.swordAttack > 0 ? 'Attack' : 'Hold', 2 - this.swordAttack)
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
        case 'KeyF':
            this.swordAttack = 2
            break
        // case 'KeyE':
        //     this.rotation = (this.rotation + 1) % 4
        //     this.rotationChange++
        //     break
        // case 'KeyQ':
        //     this.rotation = (this.rotation - 1 + 4) % 4
        //     this.rotationChange--
        //     break
        default:
            return
        }
        if (direction < 0) {
            GameManager.instance.playerSetFacing(this.direction)
            return
        }
        GameManager.instance.playerMove(DIRECTIONS[(direction + this.rotation) % 4])
    }

    public keyup = (evt: KeyboardEvent) => {
        this.keysDown.set(evt.code, false)
    }

}
