import MaterialManager from './MaterialManager'

export let gl

export default class Video {

    constructor (el) {
        this.base = el
        this.el = document.createElement('canvas')
        el.appendChild(this.el)

        gl = this.ctx = this.el.getContext('webgl', {
            antialias: false
        })

        this.resize()
        setTimeout(this.resize, 100)
        window.addEventListener('resize', this.resize)

        this.queue = []
        console.log('[engine/video] initialised')

    }

    resize = () => {
        const box = this.el.getBoundingClientRect()
        this.width = this.el.width = Math.floor(box.width / 2)
        this.height = this.el.height = Math.floor(box.height / 2)
        gl.viewport(0, 0, this.width, this.height)
        if (this.fbo) this.fbo.resize()
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

    fillBox (color, x, y, w, h) {
        this.queue.push(['2d', 'rect', x, y, w, h, color])
    }

    drawImage (img, x, y, z, frame = 0) {
        this.queue.push(['3d', 'img', x, y, z, img, frame])
    }

    drawVolume (v, x, y, z) {
        this.queue.push(['3d', 'vol', x, y, z, v])
    }

    run (t) {
        if (!this.fbo) {
            console.log('[engine/video] creating framebuffer')
            this.fbo = new GLFBO()
        }
        this.fbo.bind()
        this.clear()

        const data = {
            t, width: this.width, height: this.height
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        this.fbo.render(data)
    }

}

export class GLTexture {

    constructor (image) {
        this.tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

}

class GLObject3D {

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

    setColors (colors) {
        this.colors = colors
        if (this.colorBuffer) gl.deleteBuffer(this.colorBuffers)
        this.colorBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW)
    }

    draw (data) {

        this.material.use()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        this.material.attributes.aScreenCoord.set(this.mode)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)

        this.material.setUniforms(data)

        gl.drawArrays(gl.TRIANGLES, 0, this.verts.length / 2)
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

    draw (data) {

        this.material.use()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
        this.material.attributes.aScreenCoord.set(this.mode)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer)
        this.material.attributes.aTextureCoord.set(2)

        if (this.texture) {
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, this.texture.tex)
        }

        if (this.color) {
            this.material.uniforms.uColor.set(this.color)
        }

        this.material.setUniforms(data)

        gl.drawArrays(gl.TRIANGLES, 0, this.verts.length / 2)
    }

}

class GLFBO {

    constructor () {
        this.texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        this.buffer = gl.createFramebuffer()
        this.renderObject = new GLObject2D(MaterialManager.materials.defaultPost)
        this.renderObject.setTexture({tex: this.texture})
        this.renderObject.setUVs([
            0, 1,
            1, 1,
            0, 0,
            1, 1,
            1, 0,
            0, 0
        ])
        this.resize()
    }

    resize (w, h) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            w, h,
            0, gl.RGBA, gl.UNSIGNED_BYTE, null)
        this.renderObject.setVerts([
            -1, 1,
            1, 1,
            -1, -1,
            1, 1,
            1, -1,
            -1, -1
        ])
    }

    bind () {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, this.texture, 0)
    }

    render (data) {
        this.renderObject.draw(data)
    }

}