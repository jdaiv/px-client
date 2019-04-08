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
    public use = false
    private weaponOffset = vec3.create()

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
            this.walkAmp = lerp(this.walkAmp, vec3.dist(pos, this.position) > 2 ? 1 : 0, dt * 10)
            vec3.lerp(this.position, this.position, pos, dt * 4)
            quat.slerp(this.rotationQ, this.rotationQ, rot, dt * 10)
            this.engine.camera.setTarget(this.position)
            this.engine.camera.setOffset([0, 0, 0])
            this.engine.camera.setRotation(this.rotationQ)
            this.engine.camera.lookAt = false

            this.engine.camera.offset = vec3.fromValues(
                Math.cos(this.t * 4) * this.walkAmp * 0.5,
                Math.sin(this.t * 8) * this.walkAmp * 0.5,
                0
            )
        } else if (GameManager.instance.store.editor.enabled) {
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
            Math.cos(this.t * 4) * this.walkAmp * 0.5 + this.engine.v.mouseDeltaX * -0.5,
            Math.sin(this.t * 8) * this.walkAmp * 0.5 + this.engine.v.mouseDeltaY * 0.5,
            Math.cos(this.t * 1) * this.walkAmp
        )
        // this.walkAmp = this.walkAmp + dt * (0 - this.walkAmp)
        this.weaponPos = vec3.lerp(this.weaponPos, this.weaponPos, targetPos, dt * 20)
        this.t += dt * this.walkAmp * 2
        this.swordAttack -= dt

        const targetOffset = vec3.create()
        if (this.use || GameManager.instance.state.combat.casting) {
            targetOffset[1] = -96
        }
        vec3.lerp(this.weaponOffset, this.weaponOffset, targetOffset, dt * 10)

        const newRotation = Math.floor((this.engine.v.rotateCamera[1] + 270 - 45) % 360 / 90)
        if (newRotation !== this.rotation) {
            this.rotation = newRotation
            GameManager.instance.playerSetFacing(this.direction)
        }
    }

    public draw() {
        const transform = {
            position: vec3.add(vec3.create(), this.weaponPos, this.weaponOffset),
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        }
        transform.position[1] += 96
        transform.position[1] *= -1
        this.engine.v.drawModelUI(!this.use && GameManager.instance.state.combat.casting ? 'hand_cast' : 'hand',
            transform, 'outlineUI', 'colored')
        this.engine.v.drawModelUI(!this.use && GameManager.instance.state.combat.casting ? 'hand_cast' : 'hand',
            transform, 'textured', 'colored')
        vec3.add(transform.position, this.weaponPos, this.weaponOffset)
        this.engine.v.drawModelUIAnimated('sword_animated', transform, 'outlineUI', 'colored',
            this.swordAttack > 0 ? 'Attack' : 'Hold', 2 - this.swordAttack)
        this.engine.v.drawModelUIAnimated('sword_animated', transform, 'textured', 'colored',
            this.swordAttack > 0 ? 'Attack' : 'Hold', 2 - this.swordAttack)

        this.use = false
    }

    public keydown = (evt: KeyboardEvent) => {
        const gm = GameManager.instance
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
        case 'Digit1':
            gm.state.combat.casting = false
            gm.state.combat.activeSpell = ''
            break
        case 'Digit2':
            gm.state.combat.casting = true
            gm.state.combat.activeSpell = 'fireball'
            break
        case 'Digit3':
            gm.state.combat.casting = true
            gm.state.combat.activeSpell = 'icebolt'
            break
        case 'Digit4':
            gm.state.combat.casting = true
            gm.state.combat.activeSpell = 'thunderbolt'
            break
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
