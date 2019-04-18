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

    private buildHeightMap(map: any, start: number[], end: number[]): number[][] {
        const heightMap = new Array<number[]>()

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

        const solid = new Array<number[]>()
        for (let x = start[0] * TILE_SIZE; x <= end[0] * TILE_SIZE; x++) {
            heightMap[x] = new Array<number>()
            const xI = Math.floor(x / TILE_SIZE)
            for (let y = start[1] * TILE_SIZE; y <= end[1] * TILE_SIZE; y++) {
                const yI = Math.floor(y / TILE_SIZE)
                const t = tiles[xI][yI]
                heightMap[x][y] = (t >= 0 && t !== 4) ? 1 : -1
            }
        }

        return heightMap
    }

    private buildIslands(map: any, start: number[], end: number[]): vec3[][] {
        const islands = new Array<vec3[]>()

        const solid = new Array<number[]>()
        for (let x = start[0]; x <= end[0]; x++) {
            solid[x] = new Array<number>()
            for (let y = start[1]; y <= end[1]; y++) {
                solid[x][y] = -1
            }
        }
        map.forEach(t => {
            solid[t.x][t.y] = t.id
        })

        for (let y = start[1]; y <= end[1]; y++) {
            let startX: number = null
            for (let x = start[0]; x <= end[0]; x++) {
                const t = solid[x][y]
                if (t && t >= 0 && t !== 4) {
                    if (startX == null) {
                        startX = x
                    }
                } else {
                    if (startX != null) {
                        islands.push([
                            vec3.fromValues((startX - 0.5) * TILE_SIZE, 0, (y - 0.5) * TILE_SIZE),
                            vec3.fromValues((x - 0.5) * TILE_SIZE, 0, (y - 0.5) * TILE_SIZE),
                            vec3.fromValues((x - 0.5) * TILE_SIZE, 0, (y + 0.5) * TILE_SIZE),
                            vec3.fromValues((startX - 0.5) * TILE_SIZE, 0, (y + 0.5) * TILE_SIZE),
                        ])
                        startX = null
                    }
                }
            }
            if (startX != null) {
                islands.push([
                    vec3.fromValues((startX - 0.5) * TILE_SIZE, 0, (y - 0.5) * TILE_SIZE),
                    vec3.fromValues((end[0] - 0.5) * TILE_SIZE, 0, (y - 0.5) * TILE_SIZE),
                    vec3.fromValues((end[0] - 0.5) * TILE_SIZE, 0, (y + 0.5) * TILE_SIZE),
                    vec3.fromValues((startX - 0.5) * TILE_SIZE, 0, (y + 0.5) * TILE_SIZE),
                ])
                startX = null
            }
        }

        return islands
    }

    private calculateEdges(map: any, start: number[], end: number[]): boolean[][][] {
        const solid = new Array<boolean[]>()
        const edges = new Array<boolean[][]>()
        for (let x = start[0]; x <= end[0]; x++) {
            solid[x] = new Array<boolean>()
            edges[x] = new Array<boolean[]>()
            for (let y = start[1]; y <= end[1]; y++) {
                solid[x][y] = false
                // N, E, S, W
                edges[x][y] = [false, false, false, false]
            }
        }
        map.forEach(t => {
            solid[t.x][t.y] = t.id !== 4
        })
        for (let x = start[0]; x <= end[0]; x++) {
            for (let y = start[1]; y <= end[1]; y++) {
                edges[x][y][0] = solid[x][y] && (y === start[1] || !solid[x][y - 1])
                edges[x][y][1] = solid[x][y] && (x === end[0] || !solid[x + 1][y])
                edges[x][y][2] = solid[x][y] && (y === end[1] || !solid[x][y + 1])
                edges[x][y][3] = solid[x][y] && (x === start[0] || !solid[x - 1][y])
            }
        }

        // this.edges = edges

        return edges
    }

    public set(map: any[], start: number[], end: number[]) {
        const verts: number[] = []
        const uvs: number[] = []
        const waterVerts: number[] = []
        const waterUVs: number[] = []
        let y = 0
        let x0: number
        let z0: number
        const y0 = 0
        const y1 = -TILE_SIZE
        let x1: number
        let z1: number
        let u0: number
        let v0: number
        let u1: number
        let v1: number
        const edgeU0 = 1 * TEX_TILE_SIZE / this.texWidth
        const edgeV0 = 1 * TEX_TILE_SIZE / this.texHeight
        const edgeU1 = 2 * TEX_TILE_SIZE / this.texWidth
        const edgeV1 = 0
        const edges = this.calculateEdges(map, start, end)
        const islands = this.buildIslands(map, start, end)
        const perp = vec3.create()
        const dir = vec3.create()
        const center = vec3.create()
        u0 = 3 * TEX_TILE_SIZE / this.texWidth
        v0 = 0
        u1 = (3 + 1) * TEX_TILE_SIZE / this.texWidth
        v1 = (0 + 1) * TEX_TILE_SIZE / this.texHeight
        const pi0 = vec3.create()
        const pi1 = vec3.create()
        const pi2 = vec3.create()
        const pi3 = vec3.create()
        const pi4 = vec3.create()
        const pi5 = vec3.create()
        const pi6 = vec3.create()
        islands.forEach(is => {
            for (let i = 0; i < is.length; i++) {
                const p0 = is[i]
                const p1 = is[(i + 1) % is.length]
                vec3.sub(dir, p1, p0)
                vec3.normalize(dir, dir)
                vec3.rotateY(perp, dir, [0, 0, 0], 90 * Math.PI / 180)
                const dist = vec3.dist(p0, p1)
                for (let j = 0; j < dist; j += 4) {
                    vec3.lerp(pi0, p0, p1, j / dist)
                    vec3.lerp(pi1, p0, p1, (j + 2) / dist)
                    vec3.lerp(pi2, p0, p1, (j + 4) / dist)
                    vec3.scaleAndAdd(pi3, pi1, perp, 2)
                    vec3.scaleAndAdd(pi4, pi1, perp, -TILE_SIZE_HALF)
                    vec3.scaleAndAdd(pi6, pi0, perp, -TILE_SIZE_HALF)
                    pi4[0] = Math.round(pi4[0] / TILE_SIZE) * TILE_SIZE
                    pi4[1] = Math.round(pi4[1] / TILE_SIZE) * TILE_SIZE
                    pi4[2] = Math.round(pi4[2] / TILE_SIZE) * TILE_SIZE

                    verts.push(
                        pi0[0], pi0[1], pi0[2],
                        pi1[0], pi1[1], pi1[2],
                        pi3[0], pi3[1], pi3[2],

                        pi1[0], pi1[1], pi1[2],
                        pi2[0], pi2[1], pi2[2],
                        pi3[0], pi3[1], pi3[2],

                        pi1[0], pi1[1], pi1[2],
                        pi0[0], pi0[1], pi0[2],
                        pi4[0], pi4[1], pi4[2],

                        pi2[0], pi2[1], pi2[2],
                        pi1[0], pi1[1], pi1[2],
                        pi4[0], pi4[1], pi4[2],
                    )
                    uvs.push(
                        u0, v0,
                        u0, v1,
                        u1, v0,

                        u0, v1,
                        u1, v1,
                        u1, v0,

                        u0, v1,
                        u1, v1,
                        u1, v0,

                        u0, v1,
                        u1, v1,
                        u1, v0,
                    )
                    if (j > 0) {
                        vec3.scaleAndAdd(pi5, pi0, perp, -TILE_SIZE_HALF)
                        verts.push(
                            pi0[0], pi0[1], pi0[2],
                            pi5[0], pi5[1], pi5[2],
                            pi4[0], pi4[1], pi4[2],
                        )
                        uvs.push(
                            u0, v0,
                            u0, v1,
                            u1, v0,
                        )
                    }

                    if (j < dist - 4) {
                        vec3.scaleAndAdd(pi6, pi1, perp, -TILE_SIZE_HALF)
                        verts.push(
                            pi0[0], pi0[1], pi0[2],
                            pi5[0], pi5[1], pi5[2],
                            pi4[0], pi4[1], pi4[2],
                        )
                        uvs.push(
                            u0, v0,
                            u0, v1,
                            u1, v0,
                        )
                    }
                }
            }
        })
        // map.forEach(t => {
        //     if (t.id === 4) return
        //     x0 = t.x * TILE_SIZE - TILE_SIZE_HALF
        //     z0 = t.y * TILE_SIZE - TILE_SIZE_HALF
        //     x1 = t.x * TILE_SIZE + TILE_SIZE_HALF
        //     z1 = t.y * TILE_SIZE + TILE_SIZE_HALF
        //     verts.push(
        //         x0, y, z0,
        //         x0, y, z1,
        //         x1, y, z0,
        //         x0, y, z1,
        //         x1, y, z1,
        //         x1, y, z0,
        //     )
        //     const texY = Math.floor(t.id / this.tilesX)
        //     const texX = Math.floor(t.id % this.tilesX)
        //     u0 = texX * TEX_TILE_SIZE / this.texWidth
        //     v0 = texY
        //     u1 = (texX + 1) * TEX_TILE_SIZE / this.texWidth
        //     v1 = (texY + 1) * TEX_TILE_SIZE / this.texHeight
        //     uvs.push(
        //         u0, v0,
        //         u0, v1,
        //         u1, v0,
        //         u0, v1,
        //         u1, v1,
        //         u1, v0,
        //     )

        //     if (edges[t.x][t.y][0]) {
        //         verts.push(
        //             x1, y0, z0,
        //             x1, y1, z0,
        //             x0, y0, z0,
        //             x1, y1, z0,
        //             x0, y1, z0,
        //             x0, y0, z0,
        //         )
        //         uvs.push(
        //             edgeU0, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV0,
        //             edgeU1, edgeV1,
        //         )
        //     }
        //     if (edges[t.x][t.y][2]) {
        //         verts.push(
        //             x0, y0, z1,
        //             x0, y1, z1,
        //             x1, y0, z1,
        //             x0, y1, z1,
        //             x1, y1, z1,
        //             x1, y0, z1,
        //         )
        //         uvs.push(
        //             edgeU0, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV0,
        //             edgeU1, edgeV1,
        //         )
        //     }
        //     if (edges[t.x][t.y][1]) {
        //         verts.push(
        //             x1, y0, z1,
        //             x1, y1, z1,
        //             x1, y0, z0,
        //             x1, y1, z1,
        //             x1, y1, z0,
        //             x1, y0, z0,
        //         )
        //         uvs.push(
        //             edgeU0, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV0,
        //             edgeU1, edgeV1,
        //         )
        //     }
        //     if (edges[t.x][t.y][3]) {
        //         verts.push(
        //             x0, y0, z0,
        //             x0, y1, z0,
        //             x0, y0, z1,
        //             x0, y1, z0,
        //             x0, y1, z1,
        //             x0, y0, z1,
        //         )
        //         uvs.push(
        //             edgeU0, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV1,
        //             edgeU0, edgeV0,
        //             edgeU1, edgeV0,
        //             edgeU1, edgeV1,
        //         )
        //     }

        // })
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
