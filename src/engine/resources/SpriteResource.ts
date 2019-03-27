import { vec3 } from 'gl-matrix'
import GLTexture from '../rendering/GLTexture'

export default class SpriteResource {

    public src: string
    public trueWidth: number
    public width: number
    public height: number
    public frames: number
    public spriteScale: vec3
    public isSprite: boolean

    public texture: GLTexture

    private image: HTMLImageElement

    constructor(src: string, data: any, isSprite = true) {
        this.src = src

        const frameKeys = Object.keys(data.frames)

        this.isSprite = isSprite
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
                this.texture = new GLTexture(this.image, this.isSprite)
                resolve()
            }
            this.image.src = this.src
        })
    }

    public static async load(src: string, data: any, isSprite = true): Promise<SpriteResource> {
        const sprite = new SpriteResource(src, data, isSprite)
        await sprite.loadImage()
        return sprite
    }

}
