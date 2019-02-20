import Resources from './Resources'
import { gl } from './Video'

/* Let's write a material manager with no clue of how to do it! */

const MATERIALS = {
    default: {
        vs: 'default_vs',
        fs: 'default_fs',
        attributes: [
            {
                name: 'aVertexColor',
                type: 'vec4'
            }
        ]
    },
    defaultSprite: {
        vs: 'default_sprite_vs',
        fs: 'default_sprite_fs',
        attributes: [
            {
                name: 'aTextureCoord',
                type: 'vec2'
            },
            {
                name: 'aVertexNormal',
                type: 'vec4'
            }
        ]
    },
    outline: {
        vs: 'outline_vs',
        fs: 'outline_fs',
        attributes: [
            {
                name: 'aTextureCoord',
                type: 'vec2'
            },
            {
                name: 'aVertexNormal',
                type: 'vec4'
            }
        ]
    },
    defaultPost: {
        vs: 'default_post_vs',
        fs: 'default_post_fs',
        attributes: [
            {
                name: 'aTextureCoord',
                type: 'vec2'
            }
        ]
    },
}

const DEFAULT_ATTRIBUTES = [
    {
        name: 'aVertexPosition',
        type: 'vec4'
    }
]

const DEFAULT_UNIFORMS = [
    {
        name: 'uTime',
        type: 'float',
        precision: 'highp',
        length: 1,
        value: ({ t }) => t
    },
    {
        name: 'uColor',
        type: 'vec4',
        fsOnly: true
    },
    {
        name: 'uSampler',
        type: 'sampler2D',
        value: () => 0,
        fsOnly: true
    },
    {
        name: 'uVP_Matrix',
        type: 'mat4',
        length: 4,
        value: ({ matrix }) => matrix,
        vsOnly: true
    },
    {
        name: 'uM_Matrix',
        type: 'mat4',
        length: 4,
        vsOnly: true
    },
    {
        name: 'uScreenSize',
        type: 'vec2',
        precision: 'mediump',
        length: 2,
        value: ({ width, height }) => [width, height]
    }
]

export default class MaterialManager {

    static load () {
        console.log('loading materials')
        MaterialManager.generateDefaultHeaders()
        this.materials = []
        for (let key in MATERIALS) {
            console.log('reading material:', key)
            this.materials[key] = new Material(MATERIALS[key])
        }
    }

    static generateDefaultHeaders () {
        MaterialManager.defaultVSHeader = 'precision mediump float;\n'
        MaterialManager.defaultFSHeader = 'precision highp float;\n'

        DEFAULT_ATTRIBUTES.forEach(a => {
            MaterialManager.defaultVSHeader += `attribute ${a.type} ${a.name};\n`
        })
        DEFAULT_UNIFORMS.forEach(u => {
            const precision = u.precision || ''
            const str = `uniform ${precision} ${u.type} ${u.name + (u.array ? `[${u.length}]` : '')};\n`
            if (!u.vsOnly) MaterialManager.defaultFSHeader += str
            if (!u.fsOnly) MaterialManager.defaultVSHeader += str
        })
    }

}

class Material {

    constructor (data) {
        this.data = data
        this.linkShader()

        this.attributes = {}
        this.uniforms = {}
        DEFAULT_ATTRIBUTES.forEach(a => this.addAttribute(a))
        if (data.attributes) data.attributes.forEach(a => this.addAttribute(a))
        DEFAULT_UNIFORMS.forEach(u => this.addUniform(u))
    }

    use () {
        gl.useProgram(this.program)
        for (let key in this.attributes) {
            gl.enableVertexAttribArray(this.attributes[key].location)
        }
    }

    end () {
        for (let key in this.attributes) {
            gl.disableVertexAttribArray(this.attributes[key].location)
        }
    }

    addAttribute (a) {
        const location = gl.getAttribLocation(this.program, a.name)
        this.attributes[a.name] = {
            location,
            set: (length, type = gl.FLOAT, normalized = false) => {
                gl.vertexAttribPointer(location, length, type, normalized, 0, 0)
            }
        }
    }

    addUniform (u) {
        const location = gl.getUniformLocation(this.program, u.name)
        const func = {
            float: '1f',
            vec2: '2fv',
            vec4: '4fv',
            mat4: 'Matrix4fv',
            sampler2D: '1i',
        }[u.type]
        this.uniforms[u.name] = {
            location,
            set: u.type == 'mat4' ?
                gl['uniform' + func].bind(gl, location, false) :
                gl['uniform' + func].bind(gl, location)
        }
    }

    setUniforms (data) {
        DEFAULT_UNIFORMS.forEach(u => {
            if (u.value) {
                this.uniforms[u.name].set(u.value(data))
            }
        })
    }

    linkShader () {
        this.vs = this.load(gl.VERTEX_SHADER,
            MaterialManager.defaultVSHeader +
            Resources.texts[this.data.vs])
        this.fs = this.load(gl.FRAGMENT_SHADER,
            MaterialManager.defaultFSHeader +
            Resources.texts[this.data.fs])

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

    load(type, source) {
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