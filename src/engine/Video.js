import MaterialManager from './Materials'
import { mat4, vec3 } from 'gl-matrix'
import Resources from './Resources'
// import { toRadian } from 'gl-matrix/src/gl-matrix/common'

const SCALE = 1
const INIT_QUEUE_SIZE = 16

export let gl

export default class Video {

    constructor (el, engine) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        this.engine = engine

        gl = this.ctx = this.el.getContext('webgl', {
            antialias: false
        })

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.enable(gl.CULL_FACE)

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.queue = new Map()
        console.log('[engine/video] initialised')
    }

    initQueue () {
        for (let key in MaterialManager.materials) {
            let map = new Map()
            this.queue.set(key, map)
            for (let mKey in Resources.models) {
                let array = new Array(INIT_QUEUE_SIZE)
                for (let i = 0; i < INIT_QUEUE_SIZE; i++) {
                    array[i] = {
                        texture: 'test',
                        position: [0, 0, 0],
                        scale: null,
                        frame: null
                    }
                }
                map.set(mKey, {
                    count: 0,
                    array
                })
            }
        }
    }

    sortQueue () {
        this.queue.forEach(q => {
            q.forEach(mq => {
                mq.array.sort((a, b) => {
                    if (a.texture < b.texture) return -1
                    if (a.texture > b.texture) return 1
                    return 0
                })
            })
        })
    }

    clearQueue () {
        this.queue.forEach(q => {
            q.forEach(mq => mq.count = 0)
        })
    }

    resize () {
        console.log('[engine/video] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width / SCALE)
            this.height = this.el.height = Math.floor(box.height / SCALE)
            // this prevents weird half pixel scaling
            this.el.style.width = this.width * SCALE + 'px'
            this.el.style.height = this.height * SCALE + 'px'
            gl.viewport(0, 0, this.width, this.height)
            if (this.fbo) this.fbo.resize(this.width, this.height)
        })
    }

    destroy () {
        window.removeEventListener('resize', this.resize)
        this.el.remove()
        console.log('[engine/video] destroyed')
    }

    clear () {
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    }

    drawMesh (name, { position, scale }, material, texture) {
        const q = this.queue.get(material).get(name)
        if (q.array.length == q.count) q.array.push({})
        const qObj = q.array[q.count++]
        qObj.texture = texture
        qObj.position = position
        qObj.scale = scale
        qObj.frame = null
    }

    drawSprite (name, { position, scale }, material, frame) {
        const q = this.queue.get(material).get('quad')
        if (q.array.length == q.count) q.array.push({})
        const qObj = q.array[q.count++]
        qObj.texture = name
        qObj.position = position
        qObj.scale = scale
        qObj.frame = frame
    }

    run (t, f) {
        if (!this.fbo) {
            console.log('[engine/video] creating framebuffer')
            this.fbo = new GLFBO()
            this.fbo.resize(this.width, this.height)
        }
        this.fbo.bind()

        let matrix = mat4.create()
        let matrixV = mat4.create()
        mat4.identity(matrixV)

        mat4.perspective(matrix,
            this.engine.camera.fov * Math.PI / 180,
            this.width / this.height,
            0.1, 1000)

        let cameraPos = vec3.add(vec3.create(),
            this.engine.camera.offset,
            this.engine.camera.target)
        mat4.lookAt(matrixV, cameraPos, this.engine.camera.target, [0, 1, 0])
        mat4.mul(matrix, matrix, matrixV)

        this.data = {
            time: t,
            width: this.width,
            height: this.height,
            vpMatrix: matrix
        }

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {

            this.clearQueue()
            f()
            this.sortQueue()
            this.clear()

            this.queue.forEach((q, matKey) => {
                const material = MaterialManager.materials[matKey]

                material.use()
                material.setGlobalUniforms(this.data)
                material.preDraw()

                q.forEach((mq, modelKey) => {
                    material.bindMesh(Resources.models[modelKey].mesh)
                    let lastTexKey = null, image = null
                    for (let i = 0; i < mq.count; i++) {
                        const o = mq.array[i]
                        if (lastTexKey != o.texture) {
                            image = Resources.images[o.texture]
                            material.setTexture(image.tex.tex)
                            lastTexKey = o.texture
                        }
                        let matrix = mat4.create()
                        mat4.identity(matrix)
                        mat4.translate(matrix, matrix, o.position)
                        if (o.scale == 's') mat4.scale(matrix, matrix, [image.width / 16, image.height / 16, 1])
                        else if (o.scale) mat4.scale(matrix, matrix, o.scale)
                        let spriteData = [0, 0]
                        if (o.frame != null) {
                            spriteData[0] = image.frames
                            spriteData[1] = o.frame
                        }
                        material.setMeshUniforms(matrix, spriteData)
                        material.draw()
                    }
                })

                material.postDraw()
                material.end()
            })
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            this.fbo.render(this.data)
        }
    }

}

export class GLTexture {

    constructor (image) {
        this.tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    }

}

export class GLMesh {

    constructor (rawMesh) {
        this.setVerts(rawMesh.verts)
        this.setUVs(rawMesh.uvs)
        if (rawMesh.normals) this.setNormals(rawMesh.normals)
    }

    setVerts (verts) {
        this.verts = verts
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        this.vertBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW)
    }

    setNormals (verts) {
        this.normals = verts
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        this.normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW)
    }

    setUVs (uvs) {
        this.uvs = uvs
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffers)
        this.uvsBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)
    }

    destroy () {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffers) gl.deleteBuffer(this.uvsBuffers)
    }

}

class GLFBO {

    constructor () {
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

    resize (w, h) {
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
    }

    bind () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, this.texture, 0)
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER, this.renderBuffer)
    }

    render (data) {
        const material = MaterialManager.materials.post

        material.use()
        material.setGlobalUniforms(data)
        material.setTexture(this.texture)
        material.bindMesh(this.mesh)
        material.preDraw()
        material.draw()
        material.postDraw()
        material.end()
    }

}