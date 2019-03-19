import { mat4, vec3 } from 'gl-matrix'
import Engine from './Engine'
import { Material } from './Materials'
import { SpriteResource } from './Resources'
import { gl, GLFBO, GLMesh } from './Video'

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

    public set(map: Array<[vec3, number]>, width: number, height: number) {
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
        map.forEach((t, i) => {
            if (t[1] === 4) return
            const p = t[0]
            x0 = p[0] * TILE_SIZE - TILE_SIZE_HALF
            z0 = p[2] * TILE_SIZE - TILE_SIZE_HALF
            x1 = p[0] * TILE_SIZE + TILE_SIZE_HALF
            z1 = p[2] * TILE_SIZE + TILE_SIZE_HALF
            verts.push(
                x0, y, z0,
                x0, y, z1,
                x1, y, z0,
                x0, y, z1,
                x1, y, z1,
                x1, y, z0,
            )
            const texY = Math.floor(t[1] / this.tilesX)
            const texX = Math.floor(t[1] % this.tilesX)
            u0 = texX * TEX_TILE_SIZE / this.texWidth
            v0 = texY
            u1 = (texX + 1) * TEX_TILE_SIZE / this.texWidth
            v1 = (texY + 1) * TEX_TILE_SIZE / this.texHeight
            uvs.push(
                u0, v1,
                u0, v0,
                u1, v1,
                u0, v0,
                u1, v0,
                u1, v1,
            )

            let nextTile = map[i + width]
            if (Math.floor(i / width) === height - 1 || (nextTile && nextTile[1] === 4)) {
                verts.push(
                    x0, y0, z1,
                    x0, y1, z1,
                    x1, y0, z1,
                    x0, y1, z1,
                    x1, y1, z1,
                    x1, y0, z1,
                )
                uvs.push(
                    edgeU0, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV0,
                    edgeU1, edgeV1,
                )
            }
            nextTile = map[i + 1]
            let isEnd = Math.floor(i % width) === width - 1
            if (i !== 0 && isEnd || (!isEnd && nextTile && nextTile[1] === 4)) {
                verts.push(
                    x1, y0, z1,
                    x1, y1, z1,
                    x1, y0, z0,
                    x1, y1, z1,
                    x1, y1, z0,
                    x1, y0, z0,
                )
                uvs.push(
                    edgeU0, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV0,
                    edgeU1, edgeV1,
                )
            }
            nextTile = map[i - 1]
            isEnd = Math.floor(i % width) === 0
            if (i !== width - 1 && isEnd || (!isEnd && nextTile && nextTile[1] === 4)) {
                verts.push(
                    x0, y0, z0,
                    x0, y1, z0,
                    x0, y0, z1,
                    x0, y1, z0,
                    x0, y1, z1,
                    x0, y0, z1,
                )
                uvs.push(
                    edgeU0, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV1,
                    edgeU0, edgeV0,
                    edgeU1, edgeV0,
                    edgeU1, edgeV1,
                )
            }

        })
        x0 = -TILE_SIZE_HALF + 1
        z0 = -TILE_SIZE_HALF + 1
        y = 0
        x1 = (width - 1) * TILE_SIZE + TILE_SIZE_HALF - 1
        z1 = (height - 1) * TILE_SIZE + TILE_SIZE_HALF - 1
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
        u1 = (TILE_SIZE / this.texWidth * 2) * width
        v1 = (TILE_SIZE / this.texHeight * 2) * height
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
        gl.enable(gl.BLEND)
        gl.depthMask(false)
        mat4.fromTranslation(this.transform, [0, -14, 0])
        for (let i = 0; i < 24; i++) {
            m.setMeshUniforms(this.transform)
            mat4.translate(this.transform, this.transform, [0, 0.5, 0])
            m.draw()
        }
        gl.disable(gl.BLEND)
        gl.depthMask(true)
        m.postDraw()
        m.end()
    }

}
