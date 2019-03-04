import { vec3 } from 'gl-matrix';

export const TILE_SIZE = 16

export default class Tiles {

    constructor (engine) {
        this.engine = engine
        this.tiles = []
    }

    set ({ map, width, height }) {
        this.tiles.length = 0
        map.forEach((t, i) => {
            this.tiles.push({
                type: t.type,
                position: [
                    Math.floor(i % width) * TILE_SIZE,
                    -TILE_SIZE / 2,
                    Math.floor(i / width) * TILE_SIZE,
                ],
                rotation: vec3.create(),
                scale: vec3.fromValues(1, 1, 1)
            })
        })
    }

    draw () {
        this.tiles.forEach((p, i) => {
            this.engine.v.drawMesh('cube', p, 'textured', p.type != 'default' ? p.type : 'grid')
        })
    }

}