import { GLTexture } from './Video'

const PATH = '/resources/'

const RESOURCES = {
    IMAGES: {
        test: {
            src: 'test.png',
            frames: 1,
            dim: {
                w: 64,
                h: 64
            }
        },
        faces: {
            src: 'faces.png',
            frames: 5,
            dim: {
                w: 16,
                h: 16
            }
        },
        poses: {
            src: 'poses.png',
            frames: 7,
            dim: {
                w: 64,
                h: 32
            }
        },
        door: {
            src: 'station-door.png',
            frames: 1,
            dim: {
                w: 20,
                h: 26
            }
        },
        seat: {
            src: 'station-seat.png',
            frames: 1,
            dim: {
                w: 32,
                h: 18
            }
        },
        posters: {
            src: 'station-posters.png',
            frames: 1,
            dim: {
                w: 24,
                h: 8
            }
        },
        bin: {
            src: 'bin.png',
            frames: 1,
            dim: {
                w: 12,
                h: 12
            }
        },
        fence: {
            src: 'station-fence.png',
            frames: 1,
            dim: {
                w: 256,
                h: 21
            }
        },
        trainSign: {
            src: 'train-sign.png',
            frames: 1,
            dim: {
                w: 64,
                h: 16
            }
        },
        grid: {
            src: 'grid.png',
            frames: 1,
            dim: {
                w: 16,
                h: 16
            }
        },
        arcadecab: {
            src: 'arcadecab.png',
            frames: 1,
            dim: {
                w: 64,
                h: 64
            }
        },
    },
    TEXTS: {
        default_post_vs: 'shaders/default_post_vs.glsl',
        default_post_fs: 'shaders/default_post_fs.glsl',
        default_vs: 'shaders/default_vs.glsl',
        default_fs: 'shaders/default_fs.glsl',
        default_sprite_vs: 'shaders/default_sprite_vs.glsl',
        default_sprite_fs: 'shaders/default_sprite_fs.glsl',
        outline_vs: 'shaders/outline.vs',
        outline_fs: 'shaders/outline.fs',

        model_arcadecab: 'models/arcadecab.obj',
    }
}


export default class Resources {

    static load (updateCallback) {
        Resources.images = {}
        Resources.imagesSrc = {}
        Resources.texts = {}
        return new Promise((resolve, reject) => {
            let promises = []

            let stats = {
                total: 0,
                done: 0
            }

            let updateStats = () => {
                stats.done++
                if (updateCallback) updateCallback(stats)
            }

            console.log('loading images...')
            for (let key in RESOURCES.IMAGES) {
                const url = RESOURCES.IMAGES[key].src
                console.log(`[engine/resources] loading image ${url}`)
                stats.total++
                promises.push(Resources.loadImage(key, url)
                    .then(updateStats))
            }

            for (let key in RESOURCES.TEXTS) {
                const url = RESOURCES.TEXTS[key]
                console.log(`[engine/resources] loading text ${url}`)
                stats.total++
                promises.push(Resources.loadText(key, url)
                    .then(updateStats))
            }

            updateCallback(stats)

            Promise.all(promises).then(() => resolve())
        })
    }

    static loadImage (name, url) {
        return new Promise((resolve, reject) => {
            let img = Resources.imagesSrc[name] = new Image()
            // what if this image fails to load?
            img.onload = () => {
                const data = RESOURCES.IMAGES[name]
                Resources.images[name] = {
                    ...data,
                    el: img,
                    tex: new GLTexture(img),
                    width: data.frames > 1 ? img.width / data.frames : img.width,
                    height: img.height
                }
                resolve()
            }
            img.src = PATH + url
        })
    }

    static loadText (name, url) {
        return fetch(PATH + url)
            .then(r => r.text())
            .then(txt => Resources.texts[name] = txt)
            .catch(e => console.error(e))
    }

}