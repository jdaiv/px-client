import { GLTexture, GLMesh } from './Video'
import Util from './Util'
import { vec3 } from 'gl-matrix'

const PATH = '/resources/'

const RESOURCES = {
    IMAGES: {
        error: {
            src: 'error.png',
            frames: 1,
        },
        test: {
            src: 'test.png',
            frames: 1,
        },
        faces: {
            src: 'faces.png',
            frames: 5,
        },
        poses: {
            src: 'poses.png',
            frames: 8,
        },
        door: {
            src: 'station-door.png',
            frames: 1,
        },
        bin: {
            src: 'bin.png',
            frames: 1,
        },
        loadingSign: {
            src: 'loading.png',
            frames: 1,
        },
        grid: {
            src: 'grid.png',
            frames: 1,
        },
        grass: {
            src: 'grass.png',
            frames: 1,
        },
        water: {
            src: 'water.png',
            frames: 1,
        },
        arcadecab: {
            src: 'arcadecab.png',
            frames: 1,
        },
        sign: {
            src: 'sign.png',
            frames: 1,
        },
        itemBag: {
            src: 'item-bag.png',
            frames: 1,
        },
        dummy: {
            src: 'dummy.png',
            frames: 1,
        },
        blob: {
            src: 'blob.png',
            frames: 3,
        },
    },
    TEXTS: {
        post_vs: 'shaders/post.vs',
        post_none_fs: 'shaders/post_none.fs',
        post_bloom_fs: 'shaders/post_bloom.fs',
        post_wobble_fs: 'shaders/post_wobble.fs',
        post_rainbows_fs: 'shaders/post_rainbows.fs',
        textured_vs: 'shaders/textured.vs',
        textured_fs: 'shaders/textured.fs',
        hittest_fs: 'shaders/hittest.fs',
        outline_vs: 'shaders/outline.vs',
        outline_fs: 'shaders/outline.fs',
        error_vs: 'shaders/error.vs',
        error_fs: 'shaders/error.fs',

        model_quad: 'models/quad.obj',
        model_cube: 'models/cube.obj',
        model_arcadecab: 'models/arcadecab.obj',
        model_sign: 'models/sign.obj',
        model_error: 'models/error.obj',
        dummy: 'models/dummy.obj',
    },
    MODELS: {
        error: 'model_error',
        quad: 'model_quad',
        cube: 'model_cube',
        arcadecab: 'model_arcadecab',
        sign: 'model_sign',
        dummy: 'dummy',
    }
}

export default class Resources {

    static load (updateCallback) {
        Resources.images = {}
        Resources.imagesSrc = {}
        Resources.texts = {}
        Resources.models = {}
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

            Promise.all(promises).then(() => {
                for (let key in RESOURCES.MODELS) {
                    console.log(`[engine/resources] reading model ${key}`)
                    const rawMesh = Util.readObj(Resources.texts[RESOURCES.MODELS[key]])
                    Resources.models[key] = {
                        raw: rawMesh,
                        mesh: new GLMesh(rawMesh)
                    }
                }
                resolve()
            })
        })
    }

    static loadImage (name, url) {
        return new Promise((resolve, reject) => {
            let img = Resources.imagesSrc[name] = new Image()
            // what if this image fails to load?
            img.onload = () => {
                const data = RESOURCES.IMAGES[name]
                const width = data.frames > 1 ? img.width / data.frames : img.width
                Resources.images[name] = {
                    ...data,
                    el: img,
                    tex: new GLTexture(img),
                    width,
                    height: img.height,
                    spriteScale: vec3.fromValues(width / 16, img.height / 16, 1)
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