import GLMesh from './GLMesh'
import Material from './Material'
import { gl } from './Video'

export default class GLFBO {

    public material: Material
    public texture: WebGLTexture
    public depthTexture: WebGLTexture
    public buffer: WebGLFramebuffer
    public renderBuffer: WebGLRenderbuffer

    public mesh: GLMesh

    constructor(material: Material) {
        this.material = material
        this.texture = gl.createTexture()
        this.depthTexture = gl.createTexture()
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
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24,
            w, h,
            0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h)
    }

    public bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, this.texture, 0)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
            gl.TEXTURE_2D, this.depthTexture, 0)
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer)
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
            gl.RENDERBUFFER, this.renderBuffer)
    }

    public render(data: any) {
        const m = this.material
        m.use()
        m.setGlobalUniforms(data)
        m.setTexture(this.texture)
        m.setTextureTwo(this.depthTexture)
        m.bindMesh(this.mesh)
        m.preDraw()
        m.draw()
        m.postDraw()
        m.end()
    }

}
