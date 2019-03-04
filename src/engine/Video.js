import MaterialManager from './Materials'
import { mat4, vec3, quat } from 'gl-matrix'
import Resources from './Resources'
import { autorun } from 'mobx'
import Services from '../services'

let SCALE = 4
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

        this.fboReady = false
        this.postStack = [
            // 'post_rainbows',
            // 'post_wobble',
            'post_bloom',
        ]

        this.hitTestData = new Uint8Array(4)
        this.hitTestCallbacks = new Map()

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)
        this.el.addEventListener('mousemove', this.mouseMove.bind(this))
        this.el.addEventListener('mouseenter', () => { this.mouseActive = true })
        this.el.addEventListener('mouseleave', () => { this.mouseActive = false })

        autorun(() => {
            SCALE = Services.ui.quality
            this.resize()
        }, { delay: 250 })

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
                        position: vec3.create(),
                        rotation: vec3.create(),
                        scale: vec3.fromValues(1, 1, 1),
                        sprite: false,
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
            if (this.fboReady) {
                this.fbos.forEach(fbo => fbo.resize(this.width, this.height))
            }
        }, 50)
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

    drawMesh (name, { position, rotation, scale }, material, texture, mouseData = null) {
        if (!Resources.images[texture]) {
            texture = 'error'
        }
        if (!Resources.models[name]) {
            name = 'error'
            material = 'error'
        }
        const q = this.queue.get(material).get(name)
        if (q.array.length == q.count) q.array.push({
            position: vec3.create(),
            rotation: vec3.create(),
            scale: vec3.create()
        })
        const qObj = q.array[q.count++]
        qObj.texture = texture
        vec3.copy(qObj.position, position)
        vec3.copy(qObj.rotation, rotation)
        vec3.copy(qObj.scale, scale)
        qObj.sprite = false
        qObj.frame = null
        qObj.mouseData = mouseData
    }

    drawSprite (name, { position, rotation }, material, frame, mouseData = null) {
        if (!Resources.images[name]) name = 'error'
        const q = this.queue.get(material).get('quad')
        if (q.array.length == q.count) q.array.push({
            position: vec3.create(),
            rotation: vec3.create(),
            scale: vec3.create()
        })
        const qObj = q.array[q.count++]
        qObj.texture = name
        vec3.copy(qObj.position, position)
        vec3.copy(qObj.rotation, rotation)
        qObj.sprite = true
        qObj.frame = frame
        qObj.mouseData = mouseData
    }

    run (dt, t, f) {
        if (!this.fboReady) {
            console.log('[engine/video] creating framebuffer')
            this.fbos = []
            this.fbos = this.postStack.map((mat) => {
                let fbo = new GLFBO(mat)
                fbo.resize(this.width, this.height)
                return fbo
            })
            this.fboReady = true
        }

        const camera = this.engine.camera.calculate(dt)

        let matrix = mat4.create()
        let matrixV = mat4.create()
        mat4.identity(matrixV)

        mat4.perspective(matrix,
            camera.fov * Math.PI / 180,
            this.width / this.height,
            0.1, 1000)

        let cameraPos = vec3.add(vec3.create(),
            camera.offset,
            camera.target)
        mat4.lookAt(matrixV, cameraPos, camera.target, [0, 1, 0])
        mat4.mul(matrix, matrix, matrixV)

        this.engine.overlay.matrix = matrix

        this.data = {
            time: t,
            width: this.width,
            height: this.height,
            vpMatrix: matrix
        }

        this.clearQueue()
        f()

        this.fbos[0].bind()

        if (window.debugHitTest || this.mouseActive) {
            this.clear()

            const htMat = MaterialManager.materials.hitTest

            htMat.use()
            htMat.setGlobalUniforms(this.data)
            htMat.preDraw()
            this.queue.forEach((q, matKey) => {
                q.forEach((mq, modelKey) => {
                    htMat.bindMesh(Resources.models[modelKey].mesh)
                    let color = [255, 255, 255, 255]
                    let nullColor = [0, 0, 0, 255]
                    for (let i = 0; i < mq.count; i++) {
                        const o = mq.array[i]
                        const image = Resources.images[o.texture]
                        htMat.setTexture(image.tex.tex)
                        let matrix = mat4.create()
                        let _quat = quat.create()
                        let _scale = o.sprite ? image.spriteScale : o.scale
                        quat.fromEuler(_quat, o.rotation[0], o.rotation[1], o.rotation[2])
                        mat4.fromRotationTranslationScale(matrix, _quat, o.position, _scale)
                        let spriteData = [0, 0]
                        if (o.frame != null) {
                            spriteData[0] = image.frames
                            spriteData[1] = o.frame
                        }
                        htMat.setMeshUniforms(matrix, spriteData, o.mouseData ? color : nullColor)
                        htMat.draw()
                        if (!o.mouseData) continue

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
            const cb = this.hitTestCallbacks.get(key)
            if (cb) {
                cb.callback()
            }
        }

        if (!window.debugHitTest) {
            this.clear()

            this.queue.forEach((q, matKey) => {
                const material = MaterialManager.materials[matKey]

                material.use()
                material.setGlobalUniforms(this.data)
                material.preDraw()

                q.forEach((mq, modelKey) => {
                    material.bindMesh(Resources.models[modelKey].mesh)
                    for (let i = 0; i < mq.count; i++) {
                        const o = mq.array[i]
                        const image = Resources.images[o.texture]
                        material.setTexture(image.tex.tex)
                        let matrix = mat4.create()
                        let _quat = quat.create()
                        let _scale = o.sprite ? image.spriteScale : o.scale
                        quat.fromEuler(_quat, o.rotation[0], o.rotation[1], o.rotation[2])
                        mat4.fromRotationTranslationScale(matrix, _quat, o.position, _scale)
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

        this.fbos.forEach((fbo, i) => {
            if (i >= this.fbos.length - 1) {
                gl.bindRenderbuffer(gl.RENDERBUFFER, null)
                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            } else {
                this.fbos[i + 1].bind()
            }
            // got to remember to clear buffer before drawing
            this.clear()
            fbo.render(this.data)
        })
    }

    mouseMove (evt) {
        this.mouseX = Math.floor(evt.offsetX / SCALE)
        this.mouseY = Math.floor(evt.offsetY / SCALE)
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
        this.raw = rawMesh
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

    constructor (material) {
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
        const material = MaterialManager.materials[this.material]

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