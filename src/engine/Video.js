import MaterialManager from './MaterialManager'
import { mat4, vec3 } from 'gl-matrix'
// import { toRadian } from 'gl-matrix/src/gl-matrix/common'

export let gl

export default class Video {

    constructor (el) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        gl = this.ctx = this.el.getContext('webgl', {
            antialias: false
        })

        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.enable(gl.CULL_FACE)

        this.resize = this.resize.bind(this)
        this.resize()
        window.addEventListener('resize', this.resize)

        this.queue = []
        console.log('[engine/video] initialised')

    }

    resize () {
        console.log('[engine/video] resizing')
        setTimeout(() => {
            const box = this.base.getBoundingClientRect()
            this.width = this.el.width = Math.floor(box.width / 2)
            this.height = this.el.height = Math.floor(box.height / 2)
            // this prevents weird half pixel scaling
            this.el.style.width = this.width * 2 + 'px'
            this.el.style.height = this.height * 2 + 'px'
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

    draw (obj) {
        obj.draw(this.data)
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
        // mat4.ortho(matrix,
        //     0, this.width / 2, 0, this.height / 2,
        //     -1000, 1000)

        mat4.perspective(matrix,
            60 * Math.PI / 180,
            this.width / this.height,
            0.1, 1000)

        // mat4.translate(matrixV, matrixV, [this.width / 4, this.height / 4, -10])
        mat4.translate(matrixV, matrixV, [0, -16, -80])
        mat4.rotate(matrixV, matrixV, t / 800, [0, 1, 0])
        // mat4.rotate(matrixV, matrixV, 0.4, [1, 0, 0])
        mat4.mul(matrix, matrix, matrixV)

        this.data = {
            t,
            width: this.width,
            height: this.height,
            matrix
        }

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            this.clear()
            f()
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

export class GLObject3D {

    constructor (material, cull = 1) {
        this.material = material
        this.verts = []
        this.normals = []
        this.uvs = []
        this.texture = null
        this.position = vec3.create()
        this.rotation = vec3.create()
        this.scale = [1, 1, 1]
        this.cull = cull
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

    setTexture (tex) {
        this.texture = tex
    }

    destroy () {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.normalBuffer) gl.deleteBuffer(this.normalBuffer)
        if (this.uvsBuffers) gl.deleteBuffer(this.uvsBuffers)
    }

    draw (data) {

        this.material.use()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        this.material.attributes.aVertexPosition.set(3)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
        this.material.attributes.aVertexNormal.set(3, gl.FLOAT, true)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        this.material.attributes.aTextureCoord.set(2)

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.texture.tex)
        }

        let matrix = mat4.create()
        mat4.identity(matrix)
        mat4.scale(matrix, matrix, this.scale)
        mat4.translate(matrix, matrix, this.position)

        this.material.setUniforms(data)
        this.material.uniforms.uM_Matrix.set(matrix)

        if (this.cull == 0) gl.disable(gl.CULL_FACE)
        if (this.cull == -1) gl.cullFace(gl.FRONT)
        // if (this.cull == -1) gl.frontFace(gl.CW)
        gl.drawArrays(gl.TRIANGLES, 0, this.verts.length / 3)
        if (this.cull == 0) gl.enable(gl.CULL_FACE)
        if (this.cull == -1) gl.cullFace(gl.BACK)
        // if (this.cull == -1) gl.frontFace(gl.CCW)

        this.material.end()
    }

}

class GLObject2D {

    constructor (material) {
        this.material = material
        this.verts = []
        this.uvs = []
        this.texture = null
    }

    setVerts (verts, mode) {
        this.verts = verts
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        this.vertBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW)
        this.mode = mode || 2
    }

    setUVs (uvs) {
        this.uvs = uvs
        if (this.uvsBuffer) gl.deleteBuffer(this.uvsBuffers)
        this.uvsBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW)
    }

    setTexture (tex) {
        this.texture = tex
    }

    destroy () {
        if (this.vertBuffer) gl.deleteBuffer(this.vertBuffer)
        if (this.uvsBuffers) gl.deleteBuffer(this.uvsBuffers)
    }

    draw (data) {

        this.material.use()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        this.material.attributes.aVertexPosition.set(this.mode)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        this.material.attributes.aTextureCoord.set(2)

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.texture.tex)
        }

        this.material.setUniforms(data)

        gl.drawArrays(gl.TRIANGLES, 0, this.verts.length / 2)

        this.material.end()
    }

}

class GLFBO {

    constructor () {
        this.texture = gl.createTexture()
        this.buffer = gl.createFramebuffer()
        this.renderBuffer = gl.createRenderbuffer()
        this.renderObject = new GLObject2D(MaterialManager.materials.defaultPost)
        this.renderObject.setTexture({ tex: this.texture })
        this.renderObject.setVerts([
            -1, -1,
            1, 1,
            -1, 1,
            -1, -1,
            1, -1,
            1, 1,
        ])
        this.renderObject.setUVs([
            0, 0,
            1, 1,
            0, 1,
            0, 0,
            1, 0,
            1, 1,
        ])
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
        this.renderObject.draw(data)
    }

}