import Engine from '../../Engine'
import IEffect from './IEffect'

export default class ScreenShake implements IEffect {

    private engine: Engine

    constructor(engine: Engine) {
        this.engine = engine
    }

    public * run(params: any) {
        this.engine.camera.addShake([params.x, 0, params.y])
        yield true
    }

}
