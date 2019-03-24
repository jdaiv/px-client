import { mat4, quat, vec2, vec3, vec4 } from 'gl-matrix'
import { autorun } from 'mobx'
import GameManager from '../shared/GameManager'
import Engine from './Engine'
import { Material } from './Materials'
import Resources from './Resources'

let SCALE = 2
const INIT_QUEUE_SIZE = 16

export let gl: WebGLRenderingContext

type RenderingQueue = Map<string, Map<string, { count: number; array: any[] }>>
interface ITransform {
    position: number[] | vec3
    rotation?: number[] | vec3
    scale?: number[] | vec3
}

export default class Video {

    private width: number
    private height: number

    private base: Element
    private el: HTMLCanvasElement
    private engine: Engine
    private resources: Resources

    private fboReady: boolean
    private fbos: GLFBO[] = []
    private postStack: string[]

    private hitTestData: Uint8Array
    private hitTestCallbacks: Map<string, any>
    private mouseActive: boolean
    private captureMouse: boolean
    private mouseX: number
    private mouseY: number
    private activeMouseObject: string
    private rotateCamera = vec3.create()

    private queue: RenderingQueue

    constructor(el: Element, engine: Engine) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        this.engine = engine
        this.resources = engine.resources

        gl = this.el.getContext('webgl', {
            antialias: false
        })

        gl.getExtension('OES_standard_derivatives')
        gl.getExtension('OES_texture_float')

        gl.enable(gl.DEPTH_TEST)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.enable(gl.CULL_FACE)

        this.fboReady = false
        this.postStack = [
            // 'post_rainbows',
            // 'post_wobble',
            'post_bloom',
            'post_none',
        ]

        this.hitTestData = new Uint8Array(4)
        this.hitTestCallbacks = new Map()

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)
        this.el.addEventListener('mousemove', this.mouseMove.bind(this))
        this.el.addEventListener('click', this.mouseClick.bind(this))
        this.el.addEventListener('mouseenter', () => { this.mouseActive = true })
        this.el.addEventListener('mouseleave', () => { this.mouseActive = false })
        this.el.addEventListener('contextmenu', (e) => { e.preventDefault() })
        this.el.addEventListener('mousedown', (e) => { if (e.button === 2) this.captureMouse = true })
        this.el.addEventListener('mouseup', (e) => { if (e.button === 2) this.captureMouse = false  })

        autorun(() => {
            SCALE = GameManager.instance.store.settings.quality
            this.resize()
        }, { delay: 250 })

        this.queue = new Map()
        console.log('[engine/video] initialised')
    }

    public initQueue() {
        this.engine.materials.forEach((mat, key) => {
            if (mat.settings.manual) return
            const map = new Map()
            this.queue.set(key, map)
            this.engine.resources.models.forEach((__, mKey) => {
                const array = new Array(INIT_QUEUE_SIZE)
                for (let i = 0; i < INIT_QUEUE_SIZE; i++) {
                    array[i] = {
                        texture: 'test',
                        position: vec3.create(),
                        rotation: vec3.create(),
                        scale: vec3.fromValues(1, 1, 1),
                        sprite: 0,
                        frame: null
                    }
                }
                map.set(mKey, {
                    count: 0,
                    array
                })
            })
        })
    }

    private clearQueue() {
        this.queue.forEach(q => {
            q.forEach(mq => mq.count = 0)
        })
    }

    public resize() {
        console.log('[engine/video] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = Math.floor(box.width / SCALE)
            this.height = Math.floor(box.height / SCALE)
            if (SCALE % 2 === 0) {
                this.width -= this.width % 2
                this.height -= this.height % 2
            }
            this.el.width = this.width
            this.el.height = this.height
            // this prevents weird half pixel scaling
            this.el.style.width = this.width * SCALE + 'px'
            this.el.style.height = this.height * SCALE + 'px'
            gl.viewport(0, 0, this.width, this.height)
            if (this.fboReady) {
                this.fbos.forEach(fbo => fbo.resize(this.width, this.height))
            }
        }, 50)
    }

    public destroy() {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/video] destroyed')
    }

    public clear() {
        gl.clearColor(0, 0, 0, 0)
// tslint:disable-next-line: no-bitwise
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT)
    }

    public drawMesh(name: string, { position, rotation, scale }: ITransform,
                    material: string, texture: string, mouseData?: any) {
        if (!this.resources.sprites.has(texture)) {
            texture = 'error'
        }
        if (!this.resources.models.has(name)) {
            name = 'error'
            material = 'error'
        }
        const q = this.queue.get(material).get(name)
        if (q.array.length === q.count) q.array.push({
            position: vec3.create(),
            rotation: vec3.create(),
            scale: vec3.create()
        })
        const qObj = q.array[q.count++]
        qObj.texture = texture
        vec3.copy(qObj.position, position)
        vec3.copy(qObj.rotation, rotation)
        vec3.copy(qObj.scale, scale)
        qObj.sprite = 0
        qObj.frame = null
        qObj.mouseData = mouseData
    }

    public drawSprite(name: string, { position, rotation, scale }: ITransform,
                      material: string, frame: number, mouseData?: any) {
        if (!this.resources.sprites.has(name)) {
            name = 'error'
        }
        const q = this.queue.get(material).get('quad')
        if (q.array.length === q.count) q.array.push({
            position: vec3.create(),
            rotation: vec3.create(),
            scale: vec3.create()
        })
        const qObj = q.array[q.count++]
        qObj.texture = name
        vec3.copy(qObj.position, position)
        vec3.copy(qObj.rotation, rotation)
        vec3.copy(qObj.scale, scale || [1, 1, 1])
        qObj.sprite = 1
        qObj.frame = frame
        qObj.mouseData = mouseData
    }

    public drawSpriteR(name: string, { position, rotation, scale }: ITransform,
                       material: string, frame: number, mouseData?: any) {
        if (!this.resources.sprites.has(name)) {
            name = 'error'
        }
        const q = this.queue.get(material).get('quad')
        if (q.array.length === q.count) q.array.push({
            position: vec3.create(),
            rotation: vec3.create(),
            scale: vec3.create()
        })
        const qObj = q.array[q.count++]
        qObj.texture = name
        vec3.copy(qObj.position, position)
        vec3.copy(qObj.rotation, rotation)
        vec3.copy(qObj.scale, scale || [1, 1, 1])
        qObj.sprite = 2
        qObj.frame = frame
        qObj.mouseData = mouseData
    }

    public getFBO(mat: Material) {
        const fbo = new GLFBO(mat)
        this.fbos.push(fbo)
        return fbo
    }

    public run(dt: number, t: number, f: (() => void)) {
        const materials = this.engine.materials

        if (!this.fboReady) {
            console.log('[engine/video] creating framebuffer')
            this.fbos = this.postStack.map((mat) => {
                const fbo = new GLFBO(materials.get(mat))
                return fbo
            }).concat(this.fbos)
            this.fbos.forEach(fbo => fbo.resize(this.width, this.height))
            this.fboReady = true
        }

        const camera = this.engine.camera.calculate(dt)

        const matrix = mat4.create()
        const matrixV = mat4.create()
        mat4.identity(matrixV)
        mat4.perspective(matrix,
            camera.fov * Math.PI / 180,
            this.width / this.height,
            0.1, 1000)

        const cameraPos = vec3.add(vec3.create(),
            camera.offset,
            camera.target)
        const cameraRM = mat4.create()

        if (camera.lookAt) {
            mat4.lookAt(matrixV, cameraPos, camera.target, [0, 1, 0])
        } else {
            const m = mat4.create()
            mat4.fromQuat(cameraRM, quat.mul(quat.create(), camera.rotation,
                quat.fromEuler(quat.create(),
                    this.rotateCamera[0],
                    this.rotateCamera[1],
                    this.rotateCamera[2]
                )))
            mat4.mul(matrixV, matrixV, cameraRM)
            mat4.fromTranslation(m, cameraPos)
            mat4.invert(m, m)
            mat4.mul(matrixV, matrixV, m)
        }

        quat.invert(camera.rotation, camera.rotation)

        mat4.mul(matrix, matrix, matrixV)

        this.engine.overlay.matrix = matrix

        const data = {
            time: t,
            dt,
            width: this.width,
            height: this.height,
            vpMatrix: matrix
        }

        this.clearQueue()
        f()

        this.fbos[0].bind()

        if (!this.captureMouse) {
            vec3.lerp(this.rotateCamera, this.rotateCamera, [0, 0, 0], dt * 2)
        }

        if (this.mouseActive) {
            this.clear()

            const htMat = materials.get('hitTest')
            htMat.use()
            htMat.setGlobalUniforms(data)
            htMat.preDraw()
            const color = vec4.fromValues(255, 255, 255, 255)
            const nullColor = vec4.fromValues(0, 0, 0, 255)
            this.queue.forEach((q) => {
                q.forEach((mq, modelKey) => {
                    htMat.bindMesh(this.resources.models.get(modelKey).mesh)
                    for (let i = 0; i < mq.count; i++) {
                        const o = mq.array[i]
                        if (!o.mouseData) continue
                        const image = this.resources.sprites.get(o.texture)
                        htMat.setTexture(image.texture.tex)
                        const mMat = mat4.create()
                        const rotation = quat.create()
                        const scale = vec3.create()
                        if (o.sprite === 1) {
                        quat.copy(rotation, camera.rotation)
                        } else {
                            quat.fromEuler(rotation, o.rotation[0], o.rotation[1], o.rotation[2])
                        }
                        if (o.sprite > 0) {
                            vec3.mul(scale, o.scale, image.spriteScale)
                        } else {
                            vec3.copy(scale, o.scale)
                        }
                        mat4.fromRotationTranslationScale(mMat, rotation, o.position, scale)
                        const spriteData = vec2.create()
                        if (o.frame != null) {
                            spriteData[0] = image.frames
                            spriteData[1] = o.frame
                        }
                        htMat.setMeshUniforms(mMat, spriteData, o.mouseData ? color : nullColor)
                        htMat.draw()

                        this.hitTestCallbacks.set(color.join(','), o.mouseData)

                        color[0] -= 25
                        if (color[0] < 0) {
                            color[0] = 255
                            color[1] -= 25
                        }
                        if (color[1] < 0) {
                            color[1] = 255
                            color[2] -= 25
                        }
                    }
                })
            })
            htMat.postDraw()
            htMat.end()

            gl.readPixels(this.mouseX, this.height - this.mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.hitTestData)
            const key = this.hitTestData.map(x => Math.floor(x / 5) * 5).join(',')
            this.activeMouseObject = key
            const cb = this.hitTestCallbacks.get(key)
            if (cb) {
                cb.callback('move')
            }
        }

        this.clear()

        this.engine.terrain.draw(data)

        this.queue.forEach((q, matKey) => {
            const material = materials.get(matKey)

            material.use()
            material.setGlobalUniforms(data)
            material.preDraw()

            q.forEach((mq, modelKey) => {
                material.bindMesh(this.resources.models.get(modelKey).mesh)
                for (let i = 0; i < mq.count; i++) {
                    const o = mq.array[i]
                    if (o.mouseData && !o.mouseData.draw) continue
                    const image = this.resources.sprites.get(o.texture)
                    material.setTexture(image.texture.tex)
                    const mMat = mat4.create()
                    const rotation = quat.create()
                    const scale = vec3.create()
                    if (o.sprite === 1) {
                        quat.copy(rotation, camera.rotation)
                    } else {
                        quat.fromEuler(rotation, o.rotation[0], o.rotation[1], o.rotation[2])
                    }
                    if (o.sprite > 0) {
                        vec3.mul(scale, o.scale, image.spriteScale)
                    } else {
                        vec3.copy(scale, o.scale)
                    }
                    mat4.fromRotationTranslationScale(mMat, rotation, o.position, scale)
                    const spriteData = vec2.create()
                    if (o.frame != null) {
                        spriteData[0] = image.frames
                        spriteData[1] = o.frame
                    }
                    material.setMeshUniforms(mMat, spriteData)
                    material.draw()
                }
            })

            material.postDraw()
            material.end()
        })

        this.engine.terrain.drawWater(data)
        this.engine.particles.draw(data, this.fbos[1])

        return

        this.postStack.forEach((_, i) => {
            const fbo = this.fbos[i]
            if (i >= this.postStack.length - 1) {
                gl.bindRenderbuffer(gl.RENDERBUFFER, null)
                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            } else {
                this.fbos[i + 1].bind()
            }
            // got to remember to clear buffer before drawing
            this.clear()
            fbo.render(data)
        })
    }

    public mouseMove(evt: MouseEvent) {
        const x = Math.floor(evt.offsetX / SCALE)
        const y = Math.floor(evt.offsetY / SCALE)
        if (this.captureMouse) {
            const diffX = this.mouseX - x
            const diffY = this.mouseY - y
            this.rotateCamera[1] += diffX / 2
            this.rotateCamera[0] -= diffY / 2
        }
        this.mouseX = x
        this.mouseY = y
    }

    public mouseClick() {
        const cb = this.hitTestCallbacks.get(this.activeMouseObject)
        if (cb) {
            console.log(this.activeMouseObject)
            cb.callback('click')
        }
    }

}

export class GLTexture {

    public tex: WebGLTexture

    constructor(image: TexImageSource, sprite: boolean = false) {
        this.tex = gl.createTexture()
        sprite = true
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        if (!GLTexture.isPowerOf2(image.width) || !GLTexture.isPowerOf2(image.height)) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, sprite ? gl.NEAREST : gl.LINEAR)
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sprite ? gl.NEAREST : gl.LINEAR)
    }

    public static isPowerOf2(value: number) {
// tslint:disable-next-line: no-bitwise
        return (value & (value - 1)) === 0
    }

}

export class GLMesh {

    public mode: number
    public verts: Float32Array
    public normals: Float32Array
    public uvs: Float32Array

    public vertBuffer: WebGLBuffer
    public normalBuffer: WebGLBuffer
    public uvsBuffer: WebGLBuffer

    constructor(rawMesh: any, mode?: number) {
        if (!mode) {
            mode = gl.STATIC_DRAW
        }
        this.mode = mode
        this.setVerts(rawMesh.verts)
        this.setUVs(rawMesh.uvs)
        if (rawMesh.normals) this.setNormals(rawMesh.normals)
    }

    public setVerts(verts: number[]) {
        this.verts = new Float32Array(verts)
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        this.vertBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.verts, this.mode)
    }

    public setNormals(normals: number[]) {
        this.normals = new Float32Array(normals)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        this.normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, this.mode)
    }

    public setUVs(uvs: number[]) {
        this.uvs = new Float32Array(uvs)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
        this.uvsBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.uvs, this.mode)
    }

    public destroy() {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffer)
    }

}

export class GLFBO {

    public material: Material
    public texture: WebGLTexture
    public buffer: WebGLFramebuffer
    public renderBuffer: WebGLRenderbuffer

    public mesh: GLMesh

    constructor(material: Material) {
        this.material = material
        this.texture = gl.createTexture()
        this.buffer = gl.createFramebuffer()
        this.renderBuffer = gl.createRenderbuffer()

        this.mesh = new GLMesh({
            verts: [
                -1, -1, 0,
                1, 1, 0,
                -1, 1, 0,
                -1, -1, 0,
                1, -1, 0,
                1, 1, 0,
            ],
            uvs: [
                0, 0,
                1, 1,
                0, 1,
                0, 0,
                1, 0,
                1, 1,
            ]
        })
    }

    public resize(w: number, h: number) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            w, h,
            0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h)
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, this.texture, 0)
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT,
            gl.RENDERBUFFER, this.renderBuffer)
    }

    public render(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data)
        m.setTexture(this.texture)
        m.bindMesh(this.mesh)
        m.preDraw()
        m.draw()
        m.postDraw()
        m.end()
    }

}
