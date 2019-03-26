import { quat, vec3 } from 'gl-matrix'

function rand(range: number): number {
    return Math.random() * range * 2 - range
}

export default class Camera {
    public zero = vec3.create()
    public target = vec3.create()
    public rotation = quat.create()
    public offset = vec3.fromValues(0, 90, 120)
    public fov = 90
    public shake = vec3.create()
    public lookAt = false

    public calculate(dt: number) {
        vec3.lerp(this.shake, this.shake, this.zero, dt * 10)

        const shake = vec3.normalize(vec3.create(), [rand(2), rand(2), rand(2)])
        vec3.scale(shake, shake, 0.1)
        vec3.multiply(shake, shake, this.shake)
        // shake[1] = 1

        const offset = vec3.scaleAndAdd(vec3.create(), this.offset, shake, 1)
        const target = vec3.scaleAndAdd(vec3.create(), this.target, shake, 0.1)
        return { offset, target, rotation: this.rotation, fov: this.fov, lookAt: this.lookAt }
    }

    public setTarget(pos: vec3 | number[]) {
        vec3.copy(this.target, pos)
    }

    public setOffset(pos: vec3 | number[]) {
        vec3.copy(this.offset, pos)
    }

    public setRotation(angles: quat) {
        quat.copy(this.rotation, angles)
    }

    public setRotationV(angles: vec3 | number[]) {
        quat.fromEuler(this.rotation, angles[0], angles[1], angles[2])
    }

    public setFov(fov: number) {
        this.fov = fov
    }

    public setShake(amt: vec3 | number[]) {
        vec3.copy(this.shake, amt)
    }

    public addShake(amt: vec3 | number[]) {
        vec3.add(this.shake, this.shake, amt)
    }
}
