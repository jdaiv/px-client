import { gl } from './Video'

export default class Shader {

    public program: WebGLProgram
    private vs: WebGLShader
    private fs: WebGLShader

    private vsSource: string
    private fsSource: string

    constructor(vs: string, fs: string) {
        this.vsSource = vs
        this.fsSource = fs
        this.linkShader()
    }

    public linkShader() {
        this.vs = this.load(gl.VERTEX_SHADER, this.vsSource)
        this.fs = this.load(gl.FRAGMENT_SHADER, this.fsSource)

        if (this.vs == null || this.fs == null) {
            throw new Error('Error compiling shader')
        }

        this.program = gl.createProgram()
        gl.attachShader(this.program, this.vs)
        gl.attachShader(this.program, this.fs)
        gl.linkProgram(this.program)

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Unable to init shader program: ' +
                gl.getProgramInfoLog(this.program))
            throw new Error('Error linking shader')
        }
    }

    public load(type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(source)
            console.error('Error compiling shader: ' +
                gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
        }
        return shader
    }

}
