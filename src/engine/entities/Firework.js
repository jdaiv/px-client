import { vec3 } from 'gl-matrix'

import Volume from '../Volume'
import Entity from '../Entity'
import Volume3D from '../components/Volume3D'

let box = new Volume()
box.box(-1, -1, -1, 2, 2, 2, 2).finalize()

export default class Firework extends Entity {

    timer = 0
    velocity = vec3.create()

    constructor (engine, name, id) {
        super(engine, name)

        this.networked = true
        this.networkId = id

        this.display = this.addComponent(new Volume3D(box))

        this.engine.synth.channel[2].playNote(87.31)
    }

    tick (dt) {
        super.tick(dt)
        vec3.add(this.position, this.position,
            vec3.scale(vec3.create(), this.velocity, dt))

        if (this.timer !== undefined) {
            if (this.timer > 0) {
                const p = new Particle(this.engine, 'hmm')
                p.position = vec3.clone(this.position)
                this.engine.activeStage.addEntity(p)
            } else if (!this.popped) {
                this.removeComponent(this.display)
                for (let i = 0; i < 40; i++) {
                    const p = new Particle(this.engine, 'hmm', true)
                    p.position = vec3.clone(this.position)
                    this.engine.activeStage.addEntity(p)
                }
                this.popped = true
                this.engine.synth.channel[1].playNote(38.89)
            }
        }
    }

    networkRecv ({ transform, velocity, timer }) {
        vec3.set(this.position,
            transform.position.x,
            transform.position.y,
            transform.position.z)
        vec3.set(this.velocity,
            velocity.x,
            velocity.y,
            velocity.z)
        this.timer = timer
    }

}

class Particle extends Entity {

    velocity = vec3.create()

    constructor (engine, name, bang = false) {
        super(engine, name)
        this.timer = Math.random() * 0.5

        this.display = this.addComponent(new Volume3D(box))

        if (bang) {
            this.velocity[0] = Math.random() * 200 - 100
            this.velocity[1] = Math.random() * 200 - 100
        }
    }

    tick (dt) {
        super.tick(dt)

        vec3.add(this.position, this.position,
            vec3.scale(vec3.create(), this.velocity, dt))

        this.timer -= dt
        if (this.timer < 0) this.destroy()
    }
}