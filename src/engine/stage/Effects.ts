import Engine from '../Engine'
import BloodSplatter from './effects/BloodSplatter'
import Fire from './effects/Fire'
import FireBall from './effects/FireBall'
import Ice from './effects/Ice'
import IceBolt from './effects/IceBolt'
import IEffect from './effects/IEffect'
import Lightning from './effects/Lightning'
import ScreenShake from './effects/ScreenShake'
import Shock from './effects/Shock'

export default class Effects {

    private engine: Engine
    private effects: Map<string, IEffect>
    private runningEffects: Map<IterableIterator<boolean>, boolean>

    constructor(engine: Engine) {
        this.engine = engine

        this.effects = new Map()
        this.effects.set('wood_ex', new BloodSplatter(engine))
        this.effects.set('screen_shake', new ScreenShake(engine))
        this.effects.set('fireball', new FireBall(engine))
        this.effects.set('fire', new Fire(engine))
        this.effects.set('icebolt', new IceBolt(engine))
        this.effects.set('ice', new Ice(engine))
        this.effects.set('lightning', new Lightning(engine))
        this.effects.set('shock', new Shock(engine))

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
        console.log(data)
        if (data.single) {
            if (this.effects.has(data.type)) {
                const effect = this.effects.get(data.type).run(data)
                this.runningEffects.set(effect, true)
                // effect.next()
            }
        } else {
            data.effects.forEach(eff => {
                if (this.effects.has(eff.effect)) {
                    const effect = this.effects.get(eff.effect).run(eff)
                    this.runningEffects.set(effect, true)
                    // effect.next()
                }
            })
        }
    }

}
