import Material from './Material'
import debugRayFS from './shaders/debug_ray.fs'
import debugRayVS from './shaders/debug_ray.vs'
import errorFS from './shaders/error.fs'
import errorVS from './shaders/error.vs'
import hittestFS from './shaders/hittest.fs'
// import hittestVS from './shaders/hittest.vs'
import outlineFS from './shaders/outline.fs'
import outlineVS from './shaders/outline.vs'
import postVS from './shaders/post.vs'
import postbloomFS from './shaders/post_bloom.fs'
import postnoneFS from './shaders/post_none.fs'
import postrainbowsFS from './shaders/post_rainbows.fs'
import postwobbleFS from './shaders/post_wobble.fs'
import stencilFS from './shaders/stencil.fs'
import stencilVS from './shaders/stencil.vs'
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
        transform: true,

        textured: false,
        normals: false,
        spriteData: false,

        screenSize: false,
        time: true,
    },
    debugRay: {
        vs: debugRayVS,
        fs: debugRayFS,
        transform: true,
    },
    hitTest: {
        vs: texturedVS,
        fs: hittestFS,
        transform: true,

        textured: true,
        normals: true,
        spriteData: true,
        color: true,

        screenSize: false,
        time: true,

        manual: true,
    },
    stencil: {
        vs: stencilVS,
        fs: stencilFS,
        transform: true,
        manual: true,
    },
    textured: {
        vs: texturedVS,
        fs: texturedFS,
        transform: true,

        textured: true,
        normals: true,
        spriteData: true,

        screenSize: false,
        time: true,
    },
    terrain: {
        vs: terrainVS,
        fs: terrainFS,
        transform: true,

        textured: true,
        normals: false,
        spriteData: false,

        screenSize: false,
        time: true,

        manual: true,
    },
    water: {
        vs: waterVS,
        fs: waterFS,
        transform: true,

        textured: true,
        screenSize: true,
        time: true,

        manual: true,
    },
    sprite: {
        vs: texturedVS,
        fs: texturedFS,
        transform: true,
        cull: 0,

        textured: true,
        normals: true,
        spriteData: true,

        screenSize: false,
        time: true,
    },
    outline: {
        vs: outlineVS,
        fs: outlineFS,
        transform: true,
        cull: -1,

        textured: true,
        normals: true,

        screenSize: false,
        time: false,
    },
    post_none: {
        manual: true,
        vs: postVS,
        fs: postnoneFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: false,
        time: false,
    },
    post_bloom: {
        manual: true,
        vs: postVS,
        fs: postbloomFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_rainbows: {
        manual: true,
        vs: postVS,
        fs: postrainbowsFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
    },
    post_wobble: {
        manual: true,
        vs: postVS,
        fs: postwobbleFS,
        transform: false,

        textured: true,
        normals: false,

        screenSize: true,
        time: true,
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
