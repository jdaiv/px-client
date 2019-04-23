import { mat4, vec3 } from 'gl-matrix'
import Engine from '../Engine'
import SpriteResource from '../resources/SpriteResource'
import GLMesh from './GLMesh'
import Material from './Material'
import { gl } from './Video'

export const TEX_TILE_SIZE = 32
export const TILE_SIZE = 16
export const TILE_SIZE_HALF = TILE_SIZE / 2
const TILE_SUBDIV = 32

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
    private transform: mat4

    private heightMap = new Float32Array(2048 * 2048)
    private heightTexture: WebGLTexture

    private start = [0, 0]
    private end = [0, 0]

    constructor(engine: Engine, material: Material, texture: SpriteResource) {
        this.material = material
        this.waterMaterial = engine.materials.get('water')
        this.texture = texture
        this.waterTexture = engine.resources.sprites.get('water')
        this.texWidth = texture.width
        this.texHeight = texture.height
        this.createMesh()
        this.createTexture()
        this.waterMesh = new GLMesh({}, gl.DYNAMIC_DRAW)
        this.transform = mat4.fromTranslation(mat4.create(), [0, 0, 0])
    }

    private createMesh() {
        const verts: number[] = []
        let flip = false
        for (let x = 0; x < TILE_SUBDIV * 4; x++) {
            for (let y = 0; y < TILE_SUBDIV * 4; y++) {
                const vt0 = [x / TILE_SUBDIV * TILE_SIZE, y / TILE_SUBDIV * TILE_SIZE]
                const vt1 = [(x + 1) / TILE_SUBDIV * TILE_SIZE, (y + 1) / TILE_SUBDIV * TILE_SIZE]

                if (flip) {
                    verts.push(
                        vt0[0], 0, vt0[1],
                        vt1[0], 0, vt1[1],
                        vt1[0], 0, vt0[1],

                        vt0[0], 0, vt0[1],
                        vt0[0], 0, vt1[1],
                        vt1[0], 0, vt1[1],
                    )
                } else {
                    verts.push(
                        vt0[0], 0, vt0[1],
                        vt0[0], 0, vt1[1],
                        vt1[0], 0, vt0[1],

                        vt1[0], 0, vt0[1],
                        vt0[0], 0, vt1[1],
                        vt1[0], 0, vt1[1],
                    )
                }
                flip = !flip
            }
        }
        this.mesh = new GLMesh({verts})
    }

    private createTexture() {
        this.heightTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.heightTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 2048, 2048, 0, gl.RED, gl.FLOAT, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    }

    private buildHeightMap(map: any) {
        const newHeightMap = new Float32Array(this.heightMap.length)

        for (let i = 0; i < this.heightMap.length; i++) {
            newHeightMap[i] = -16
        }

        map.forEach(t => {
            if (t.id === 4) return
            for (let x = 0; x <= 2; x++) {
                for (let y = 0; y <= 2; y++) {
                    const idx = ((t.y + 512) * 2 + y) * 2048 + ((t.x + 512) * 2 + x)
                    const newHeight = t.id > 4 ? 1 : 0
                    if (newHeightMap[idx] < newHeight) {
                        newHeightMap[idx] = newHeight
                    }
                }
            }
        })

        this.heightMap = newHeightMap

        gl.bindTexture(gl.TEXTURE_2D, this.heightTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 2048, 2048, 0, gl.RED, gl.FLOAT, this.heightMap)
    }

    public set(map: any[], start: number[], end: number[]) {
        this.start = start
        this.end = end

        this.buildHeightMap(map)

        const waterVerts: number[] = []
        const waterUVs: number[] = []

        start = [-256, -256]
        end = [512, 512]
        const x0 = TILE_SIZE * start[0] + 1 - TILE_SIZE_HALF
        const z0 = TILE_SIZE * start[1] + 1 - TILE_SIZE_HALF
        const y = 0
        const x1 = (end[0]) * TILE_SIZE + TILE_SIZE_HALF - 1
        const z1 = (end[1]) * TILE_SIZE + TILE_SIZE_HALF - 1
        waterVerts.push(
            x0, y, z0,
            x0, y, z1,
            x1, y, z0,
            x0, y, z1,
            x1, y, z1,
            x1, y, z0,
        )
        const u0 = 0
        const v0 = 0
        const u1 = (TILE_SIZE / this.texWidth * 8) * (end[0] - start[0])
        const v1 = (TILE_SIZE / this.texHeight * 8) * (end[1] - start[1])
        waterUVs.push(
            u0, v1,
            u0, v0,
            u1, v1,
            u0, v0,
            u1, v0,
            u1, v1,
        )

        this.waterMesh.setVerts(waterVerts)
        this.waterMesh.setUVs(waterUVs)
    }

    public draw(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data)
        m.setTexture(this.texture.texture.tex)
        m.setTextureTwo(this.heightTexture)
        m.bindMesh(this.mesh)
        m.preDraw()
        for (let x = Math.floor(this.start[0] / 4) * 4; x <= Math.floor(this.end[0] / 4) * 4; x += 4) {
            for (let y = Math.floor(this.start[1] / 4) * 4; y <= Math.floor(this.end[1] / 4) * 4; y += 4) {
                mat4.fromTranslation(this.transform, [x * TILE_SIZE, 0, y * TILE_SIZE])
                m.setMeshUniforms(this.transform)
                m.draw()
            }
        }
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
