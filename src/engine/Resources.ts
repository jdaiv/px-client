import { vec3 } from 'gl-matrix'
import { MODELS, SPRITES } from '../config/resources'
import Util from './Util'
import { GLMesh, GLTexture } from './Video'

class SpriteResource {

    public src: string
    public trueWidth: number
    public width: number
    public height: number
    public frames: number
    public spriteScale: vec3

    public texture: GLTexture

    private image: HTMLImageElement

    constructor(src: string, data: any) {
        this.src = src

        const frameKeys = Object.keys(data.frames)

        this.trueWidth = data.meta.size.w
        this.width = data.frames[frameKeys[0]].frame.w
        this.height = data.meta.size.h
        this.frames = frameKeys.length
        this.spriteScale = vec3.fromValues(this.width / 16, this.height / 16, 1)
    }

    public loadImage(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.image = new Image()
            // what if this image fails to load?
            this.image.onload = () => {
                this.texture = new GLTexture(this.image)
                resolve()
            }
            this.image.src = this.src
        })
    }

    public static async load(src: string, data: any): Promise<SpriteResource> {
        const sprite = new SpriteResource(src, data)
        await sprite.loadImage()
        return sprite
    }

}

class ModelResource {

    public src: string
    public mesh: GLMesh

    constructor(src: string) {
        this.src = src
        this.mesh = new GLMesh(Util.readObj(src))
    }

    public static async load(src: string): Promise<ModelResource> {
        return new ModelResource(src)
    }

}

export default class Resources {

    public sprites: Map<string, SpriteResource>
    public models: Map<string, ModelResource>

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
            console.log(`[engine/resources] loading sprite ${key}`)
            stats.total++
            promises.push(SpriteResource.load(url, SPRITES[key].data).then((res) => {
                this.sprites.set(mapKey, res)
                updateStats()
            }))
        }

        for (const key in MODELS) {
            const url = MODELS[key]
            const mapKey = key
            console.log(`[engine/resources] loading model ${key}`)
            stats.total++
            promises.push(ModelResource.load(url).then((res) => {
                this.models.set(mapKey, res)
                updateStats()
            }))
        }

        updateCallback(stats)

        return Promise.all(promises)
    }

}