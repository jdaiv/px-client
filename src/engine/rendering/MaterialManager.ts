import Material from './Material'
import debugRayFS from './shaders/debug_ray.fs'
import debugRayVS from './shaders/debug_ray.vs'
import errorFS from './shaders/error.fs'
import errorVS from './shaders/error.vs'
import outlineFS from './shaders/outline.fs'
import outlineVS from './shaders/outline.vs'
import outlineUIVS from './shaders/outline_ui.vs'
import postVS from './shaders/post.vs'
import postbloomFS from './shaders/post_bloom.fs'
import postnoneFS from './shaders/post_none.fs'
import postrainbowsFS from './shaders/post_rainbows.fs'
import postwobbleFS from './shaders/post_wobble.fs'
import terrainFS from './shaders/terrain.fs'
import terrainVS from './shaders/terrain.vs'
import texturedFS from './shaders/textured.fs'
import texturedVS from './shaders/textured.vs'
import waterFS from './shaders/water.fs'
import waterVS from './shaders/water.vs'

const MATERIALS = {
    error: {
        vs: errorVS,
        fs: errorFS,
    },
    debugRay: {
        manual: true,
        vs: debugRayVS,
        fs: debugRayFS,
    },
    textured: {
        vs: texturedVS,
        fs: texturedFS,
    },
    terrain: {
        manual: true,
        vs: terrainVS,
        fs: terrainFS,

    },
    water: {
        manual: true,
        vs: waterVS,
        fs: waterFS,
    },
    sprite: {
        vs: texturedVS,
        fs: texturedFS,
        cull: 0,
    },
    outline: {
        vs: outlineVS,
        fs: outlineFS,
        cull: -1,
    },
    outlineUI: {
        vs: outlineUIVS,
        fs: outlineFS,
        cull: -1,
    },
    post_none: {
        manual: true,
        vs: postVS,
        fs: postnoneFS,
    },
    post_bloom: {
        manual: true,
        vs: postVS,
        fs: postbloomFS,
    },
    post_rainbows: {
        manual: true,
        vs: postVS,
        fs: postrainbowsFS,
    },
    post_wobble: {
        manual: true,
        vs: postVS,
        fs: postwobbleFS,
    },
}

export default class MaterialManager {

    public static load(): Map<string, Material> {
        const map = new Map<string, Material>()
        console.log('loading materials')
        for (const key in MATERIALS) {
            console.log('reading material:', key)
            map.set(key, new Material(MATERIALS[key]))
        }
        return map
    }

}
