import { vec3 } from 'gl-matrix'

function rand (range) {
    return Math.random() * range * 2 - range
}

export default class Camera {
    zero = vec3.create()
    target = vec3.create()
    offset = vec3.fromValues(0, 90, 120)
    fov = 50
    shake = vec3.create()

    calculate (dt) {
        vec3.lerp(this.shake, this.shake, this.zero, dt * 10)

        let shake = vec3.normalize(vec3.create(), [rand(2), rand(2), rand(2)])
        vec3.multiply(shake, shake, this.shake)
        shake[1] = 1

        let offset = vec3.scaleAndAdd(vec3.create(), this.offset, shake, 1)
        let target = vec3.scaleAndAdd(vec3.create(), this.target, shake, 0.1)
        return { offset, target, fov: this.fov }
    }

    setTarget (pos) {
        vec3.copy(this.target, pos)
    }

    setOffset (pos) {
        vec3.copy(this.offset, pos)
    }

    setFov (fov) {
        this.fov = fov
    }

    setShake (amt) {
        vec3.copy(this.shake, amt)
    }

    addShake (amt) {
        vec3.add(this.shake, this.shake, amt)
    }
}