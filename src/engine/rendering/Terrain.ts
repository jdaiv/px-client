import { mat4, vec3 } from 'gl-matrix'
import Engine from '../Engine'
import SpriteResource from '../resources/SpriteResource'
import GLMesh from './GLMesh'
import Material from './Material'
import { gl } from './Video'

export const TEX_TILE_SIZE = 32
export const TILE_SIZE = 16
export const TILE_SIZE_HALF = TILE_SIZE / 2

export default class Terrain {

    private mesh: GLMesh
    private waterMesh: GLMesh

    public texture: SpriteResource
    public waterTexture: SpriteResource
    public material: Material
    public waterMaterial: Material
    // public edges: boolean[][][]

    private texWidth: number
    private texHeight: number
    private tilesX: number
    private transform: mat4

    constructor(engine: Engine, material: Material, texture: SpriteResource) {
        this.material = material
        this.waterMaterial = engine.materials.get('water')
        this.texture = texture
        this.waterTexture = engine.resources.sprites.get('water')
        this.texWidth = texture.width
        this.texHeight = texture.height
        this.tilesX = Math.floor(this.texWidth / TEX_TILE_SIZE)
        this.mesh = new GLMesh({}, gl.DYNAMIC_DRAW)
        this.waterMesh = new GLMesh({}, gl.DYNAMIC_DRAW)

        this.transform = mat4.fromTranslation(mat4.create(), [0, 0, 0])
    }

    private buildHeightMap(map: any, start: number[], end: number[]): vec3[][] {
        const tiles = new Array<number[]>()
        for (let x = start[0]; x <= end[0]; x++) {
            tiles[x] = new Array<number>()
            for (let y = start[1]; y <= end[1]; y++) {
                tiles[x][y] = -1
            }
        }
        map.forEach(t => {
            tiles[t.x][t.y] = t.id
        })

        let heightMap = new Array<vec3[]>()
        for (let x = start[0] * TILE_SIZE; x < (end[0] + 1) * TILE_SIZE; x++) {
            heightMap[x] = new Array<vec3>()
            const xI = Math.floor(x / TILE_SIZE)
            for (let y = start[1] * TILE_SIZE; y < (end[1] + 1) * TILE_SIZE; y++) {
                const yI = Math.floor(y / TILE_SIZE)
                const t = tiles[xI][yI]
                heightMap[x][y] = vec3.fromValues(
                    x - TILE_SIZE_HALF, (t >= 0 && t !== 4) ? (t > 4 ? 2 : 0) : -16, y - TILE_SIZE_HALF
                )
            }
        }
        for (let i = 0; i < 8; i++) {
            const smoothHeightMap = new Array<vec3[]>()
            smoothHeightMap[start[0] * TILE_SIZE] = heightMap[start[0] * TILE_SIZE]
            smoothHeightMap[(end[0] + 1) * TILE_SIZE - 1] = heightMap[(end[0] + 1) * TILE_SIZE - 1]
            for (let x = start[0] * TILE_SIZE + 1; x < (end[0] + 1) * TILE_SIZE - 1; x++) {
                smoothHeightMap[x] = new Array<vec3>()
                smoothHeightMap[x][start[1] * TILE_SIZE] = heightMap[x][start[1] * TILE_SIZE]
                smoothHeightMap[x][(end[1] + 1) * TILE_SIZE - 1] = heightMap[x][(end[1] + 1) * TILE_SIZE - 1]
                for (let y = start[1] * TILE_SIZE + 1; y < (end[1] + 1) * TILE_SIZE - 1; y++) {
                    const smooth = vec3.create()
                    new Array<[vec3, number]>(
                        [heightMap[x - 0][y - 0], 4.0],
                        [heightMap[x - 1][y - 0], 2.0],
                        [heightMap[x - 0][y - 1], 2.0],
                        [heightMap[x + 1][y - 0], 2.0],
                        [heightMap[x - 0][y + 1], 2.0],
                        [heightMap[x - 1][y - 1], 1.0],
                        [heightMap[x + 1][y + 1], 1.0],
                        [heightMap[x + 1][y - 1], 1.0],
                        [heightMap[x - 1][y + 1], 1.0],
                    ).forEach(([v, s]) => {
                        vec3.scaleAndAdd(smooth, smooth, v, s)
                    })
                    vec3.scale(smooth, smooth, 1 / 16)
                    smoothHeightMap[x][y] = smooth
                }
            }
            heightMap = smoothHeightMap
        }

        return heightMap
    }

    public set(map: any[], start: number[], end: number[]) {
        const verts: number[] = []
        const uvs: number[] = []
        const waterVerts: number[] = []
        const waterUVs: number[] = []
        let y = 0
        let x0: number
        let z0: number
        let x1: number
        let z1: number
        let u0: number
        let v0: number
        let u1: number
        let v1: number
        u0 = 3 * TEX_TILE_SIZE / this.texWidth
        v0 = 0
        u1 = (3 + 1) * TEX_TILE_SIZE / this.texWidth
        v1 = (0 + 1) * TEX_TILE_SIZE / this.texHeight

        const heightMap = this.buildHeightMap(map, start, end)

        for (let x = start[0] * TILE_SIZE; x < (end[0] + 1) * TILE_SIZE - 1; x++) {
            for (y = start[1] * TILE_SIZE; y < (end[1] + 1) * TILE_SIZE - 1; y++) {
                const vt0 = heightMap[x][y]
                const vt1 = heightMap[x + 1][y]
                const vt2 = heightMap[x + 1][y + 1]
                const vt3 = heightMap[x][y + 1]

                verts.push(
                    vt0[0], vt0[1], vt0[2],
                    vt2[0], vt2[1], vt2[2],
                    vt1[0], vt1[1], vt1[2],

                    vt0[0], vt0[1], vt0[2],
                    vt3[0], vt3[1], vt3[2],
                    vt2[0], vt2[1], vt2[2],
                )
                uvs.push(
                    u0, v0,
                    u0, v1,
                    u1, v0,

                    u0, v1,
                    u1, v1,
                    u1, v0,
                )
            }
        }
        start = [-256, -256]
        end = [512, 512]
        x0 = TILE_SIZE * start[0] + 1 - TILE_SIZE_HALF
        z0 = TILE_SIZE * start[1] + 1 - TILE_SIZE_HALF
        y = 0
        x1 = (end[0]) * TILE_SIZE + TILE_SIZE_HALF - 1
        z1 = (end[1]) * TILE_SIZE + TILE_SIZE_HALF - 1
        waterVerts.push(
            x0, y, z0,
            x0, y, z1,
            x1, y, z0,
            x0, y, z1,
            x1, y, z1,
            x1, y, z0,
        )
        u0 = 0
        v0 = 0
        u1 = (TILE_SIZE / this.texWidth * 8) * (end[0] - start[0])
        v1 = (TILE_SIZE / this.texHeight * 8) * (end[1] - start[1])
        waterUVs.push(
            u0, v1,
            u0, v0,
            u1, v1,
            u0, v0,
            u1, v0,
            u1, v1,
        )

        this.mesh.setVerts(verts)
        this.mesh.setUVs(uvs)
        this.waterMesh.setVerts(waterVerts)
        this.waterMesh.setUVs(waterUVs)
    }

    public draw(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data)
        mat4.fromTranslation(this.transform, [0, 0, 0])
        m.setMeshUniforms(this.transform)
        m.setTexture(this.texture.texture.tex)
        m.bindMesh(this.mesh)
        m.preDraw()
        m.draw()
        m.postDraw()
        m.end()
    }

    public drawWater(data: any) {
        const m = this.waterMaterial
        m.use()
        m.setGlobalUniforms(data)
        m.setTexture(this.waterTexture.texture.tex)
        m.bindMesh(this.waterMesh)
        m.preDraw()
        mat4.fromTranslation(this.transform, [0, -4, 0])
        m.setMeshUniforms(this.transform)
        mat4.translate(this.transform, this.transform, [0, 0.5, 0])
        m.draw()
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.depthMask(false)
        // for (let i = 1; i < 24; i++) {
        //     m.setMeshUniforms(this.transform)
        //     mat4.translate(this.transform, this.transform, [0, 0.5, 0])
        //     m.draw()
        // }
        gl.disable(gl.BLEND)
        gl.depthMask(true)
        m.postDraw()
        m.end()
    }

}
