import * as spritearcadecab from './sprites/arcadecab.json'
import * as spritebin from './sprites/bin.json'
import * as spriteblob from './sprites/blob.json'
import * as spritedummy from './sprites/dummy.json'
import * as spriteemotes from './sprites/emotes.json'
import * as spriteerror from './sprites/error.json'
import * as spritefaces from './sprites/faces.json'
import * as spritegrass from './sprites/grass.json'
import * as spritegrid from './sprites/grid.json'
import * as spriteitembag from './sprites/item-bag.json'
import * as spriteloading from './sprites/loading.json'
import * as spritepalette from './sprites/palette.json'
import * as spriteposes from './sprites/poses.json'
import * as spritesign from './sprites/sign.json'
import * as spritesmalldisplayleft from './sprites/small-display-left.json'
import * as spritesmalldisplayright from './sprites/small-display-right.json'
import * as spritesmalldisplay from './sprites/small-display.json'
import * as spritestationdoor from './sprites/station-door.json'
import * as spritestationposters from './sprites/station-posters.json'
import * as spritetest from './sprites/test.json'
import * as spritewater from './sprites/water.json'

export const MODELS = {
    'arcadecab': 'resources/models/arcadecab.obj',
    'cube': 'resources/models/cube.obj',
    'dummy': 'resources/models/dummy.obj',
    'error': 'resources/models/error.obj',
    'quad': 'resources/models/quad.obj',
    'sign': 'resources/models/sign.obj',
}

export const SPRITES = {
    'arcadecab': { file: 'resources/sprites/arcadecab.png', data: spritearcadecab },
    'bin': { file: 'resources/sprites/bin.png', data: spritebin },
    'blob': { file: 'resources/sprites/blob.png', data: spriteblob },
    'dummy': { file: 'resources/sprites/dummy.png', data: spritedummy },
    'emotes': { file: 'resources/sprites/emotes.png', data: spriteemotes },
    'error': { file: 'resources/sprites/error.png', data: spriteerror },
    'faces': { file: 'resources/sprites/faces.png', data: spritefaces },
    'grass': { file: 'resources/sprites/grass.png', data: spritegrass },
    'grid': { file: 'resources/sprites/grid.png', data: spritegrid },
    'item-bag': { file: 'resources/sprites/item-bag.png', data: spriteitembag },
    'loading': { file: 'resources/sprites/loading.png', data: spriteloading },
    'palette': { file: 'resources/sprites/palette.png', data: spritepalette },
    'poses': { file: 'resources/sprites/poses.png', data: spriteposes },
    'sign': { file: 'resources/sprites/sign.png', data: spritesign },
    'small-display-left': { file: 'resources/sprites/small-display-left.png', data: spritesmalldisplayleft },
    'small-display-right': { file: 'resources/sprites/small-display-right.png', data: spritesmalldisplayright },
    'small-display': { file: 'resources/sprites/small-display.png', data: spritesmalldisplay },
    'station-door': { file: 'resources/sprites/station-door.png', data: spritestationdoor },
    'station-posters': { file: 'resources/sprites/station-posters.png', data: spritestationposters },
    'test': { file: 'resources/sprites/test.png', data: spritetest },
    'water': { file: 'resources/sprites/water.png', data: spritewater },
}

export const SHADERS = {
    'error.fs': 'resources/shaders/error.fs',
    'error.vs': 'resources/shaders/error.vs',
    'hittest.fs': 'resources/shaders/hittest.fs',
    'hittest.vs': 'resources/shaders/hittest.vs',
    'outline.fs': 'resources/shaders/outline.fs',
    'outline.vs': 'resources/shaders/outline.vs',
    'post.vs': 'resources/shaders/post.vs',
    'post_bloom.fs': 'resources/shaders/post_bloom.fs',
    'post_none.fs': 'resources/shaders/post_none.fs',
    'post_rainbows.fs': 'resources/shaders/post_rainbows.fs',
    'post_wobble.fs': 'resources/shaders/post_wobble.fs',
    'textured.fs': 'resources/shaders/textured.fs',
    'textured.vs': 'resources/shaders/textured.vs',
}