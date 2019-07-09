import { MODELS, SPRITES, TEXTURES } from '../config/resources'
import GLTFResource from './resources/GLTFResource'
import SpriteResource from './resources/SpriteResource'

export default class Resources {

    public sprites: Map<string, SpriteResource>
    public models: Map<string, GLTFResource>

    constructor() {
        this.sprites = new Map()
        this.models = new Map()
    }

    public async load(updateCallback: ((arg0: any) => void)): Promise<any> {
        const promises = []

        const stats = {
            total: 0,
            done: 0
        }

        const updateStats = () => {
            stats.done++
            if (updateCallback) updateCallback(stats)
        }

        for (const key in SPRITES) {
            const url = SPRITES[key].file
            const mapKey = key
            console.log(`[engine/resources] loading sprite ${key}`, key !== 'water' && key !== 'terrain')
            stats.total++
            promises.push(SpriteResource.load(url, SPRITES[key].data,
                key !== 'water' && key !== 'terrain').then((res) => {
                    this.sprites.set(mapKey, res)
                    updateStats()
                }))
        }

        for (const key in TEXTURES) {
            const url = TEXTURES[key].file
            const mapKey = key
            console.log(`[engine/resources] loading sprite ${key}`)
            stats.total++
            promises.push(SpriteResource.load(url, TEXTURES[key].data, false).then((res) => {
                this.sprites.set(mapKey, res)
                updateStats()
            }))
        }

        for (const key in MODELS) {
            const url = MODELS[key]
            const mapKey = key.split('.')[0]
            console.log(`[engine/resources] loading model ${key}`)
            stats.total++
            promises.push(GLTFResource.load(url).then((res) => {
                this.models.set(mapKey, res)
                updateStats()
            }))
        }

        updateCallback(stats)

        return Promise.all(promises)
    }

}
