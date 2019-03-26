import { gl } from './Video'

export default class GLTexture {

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
