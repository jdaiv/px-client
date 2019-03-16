import Engine from '../Engine'
import BloodSplatter from './effects/BloodSplatter'
import FireBall from './effects/FireBall'
import IEffect from './effects/IEffect'
import ScreenShake from './effects/ScreenShake'

export default class Effects {

    private effects: Map<string, IEffect>
    private runningEffects: Map<IterableIterator<boolean>, boolean>

    constructor(engine: Engine) {
        this.effects = new Map()
        this.effects.set('wood_ex', new BloodSplatter(engine))
        this.effects.set('screen_shake', new ScreenShake(engine))
        this.effects.set('fireball', new FireBall(engine))

        this.runningEffects = new Map()
    }

    public tick() {
        const toDelete = new Array<IterableIterator<boolean>>()
        this.runningEffects.forEach((_, e) => {
            const n = e.next()
            const finished = n.value || n.done
            if (finished) {
                toDelete.push(e)
            }
        })
        toDelete.forEach(e => this.runningEffects.delete(e))
    }

    public handleEffect = (data: any) => {
        if (this.effects.has(data.type)) {
            const effect = this.effects.get(data.type).run(data)
            this.runningEffects.set(effect, true)
            // effect.next()
        }
    }

}
