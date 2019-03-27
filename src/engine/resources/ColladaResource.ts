import { mat4, quat, vec3 } from 'gl-matrix'
import GLMesh from '../rendering/GLMesh'

const parser = new DOMParser()
interface IMeshInput { valid: boolean, ref: string, offset: number, semantic: string }
interface IMeshSource { valid: boolean, array?: Float32Array, count?: number, stride?: number }

export default class ColladaResource {

    public src: Document
    public geometries: Element
    public animations: Element

    public meshSrc: Element
    public meshName: string

    public mesh: GLMesh

    constructor(src: string) {
        this.src = parser.parseFromString(src, 'text/xml')
        this.geometries = this.src.getElementsByTagName('library_geometries')[0]
        this.animations = this.src.getElementsByTagName('library_animations')[0]

        // find first mesh
        const scene = this.src.getElementById('Scene')
        const nodes = scene.children
        let geoNode: Element
        let geo: Element
        for (let i = 0; i < nodes.length; i++) {
            geoNode = nodes[i]
            const instances = geoNode.getElementsByTagName('instance_geometry')
            if (instances && instances[0]) {
                geo = instances[0]
                break
            }
        }
        if (!geo) {
            throw new Error('no geometry found')
        }

        this.meshSrc = this.src.getElementById(geo.getAttribute('url').substring(1))
        this.meshName = geoNode.getAttribute('name')
        console.log('loading', this.meshName)

        const polylistEl = this.meshSrc.getElementsByTagName('polylist')[0]
        const polyCount = parseInt(polylistEl.getAttribute('count'), 10)

        const polyDataCountStr = polylistEl.getElementsByTagName('vcount')[0].textContent.split(' ')
        polyDataCountStr.forEach(x => {
            // skip extra spaces
            if (x === '') return
            const int = parseInt(x, 10)
            if (int !== 3) throw new Error('model not triangulated!')
        })

        const inputs = ColladaResource.getInputs(polylistEl)
        if (inputs.length > 3 || inputs.length < 2 ||
            inputs.some(x => !x.valid || !['VERTEX', 'TEXCOORD', 'NORMAL'].includes(x.semantic))) {
            throw new Error('unsupported mesh')
        }
        inputs.sort((a, b) => a.offset - b.offset)
        const sources = ColladaResource.getSources(this.src, inputs)

        const polyData = new Uint32Array(polyCount * 3 * sources.length)
        const polyDataStr = polylistEl.getElementsByTagName('p')[0].textContent.split(' ')
        polyDataStr.forEach((x, i) => {
            let int = parseInt(x, 10)
            if (!int) int = 0
            polyData[i] = int
        })

        const verts = []
        const uvs = []
        const normals = []

        for (let polyIdx = 0; polyIdx < polyData.length; polyIdx += inputs.length) {
            inputs.forEach((input, i) => {
                const source = sources[i]
                const targetArray = { VERTEX: verts, TEXCOORD: uvs, NORMAL: normals }[input.semantic]
                for (let j = 0; j < source.stride; j++) {
                    targetArray.push(source.array[polyData[polyIdx + i] * source.stride + j])
                }
            })
        }

        for (let i = 0; i < verts.length; i += 3) {
            let temp = verts[i + 2] * 8
            verts[i + 2] = -verts[i + 1] * 8
            verts[i + 1] = temp
            verts[i] *= 8
            temp = normals[i + 2]
            normals[i + 2] = -normals[i + 1]
            normals[i + 1] = temp
        }
        for (let i = 0; i < uvs.length; i += 2) {
            uvs[i + 1] = 1 - uvs[i + 1]
        }

        this.mesh = new GLMesh({
            verts,
            uvs,
            normals
        })

        const transformEl = geoNode.getElementsByTagName('matrix')[0]
        const transformStr = transformEl.textContent.split(' ')
        const m = []
        transformStr.forEach((x, i) => {
            if (x === '') return
            let f = parseFloat(x)
            if (!f) f = 0
            m[i] = f
        })
        mat4.set(this.mesh.matrix,
            m[0 + 0], m[4 + 0], m[8 + 0], m[12 + 0],
            m[0 + 1], m[4 + 1], m[8 + 1], m[12 + 1],
            m[0 + 2], m[4 + 2], m[8 + 2], m[12 + 2],
            m[0 + 3], m[4 + 3], m[8 + 3], m[12 + 3]
        )
    }

    public static getInputs(el: Element): IMeshInput[] {
        const inputsEl = el.getElementsByTagName('input')
        const inputs = new Array<IMeshInput>()
        for (let i = 0; i < inputsEl.length; i++) {
            let valid = false
            let ref = ''
            let offset = 0
            const input = inputsEl[i]
            const semantic = input.getAttribute('semantic')
            const source = input.getAttribute('source')
            offset = parseInt(input.getAttribute('offset'), 10)
            if (source && !isNaN(offset)) {
                // cut the # from the id
                ref = source.substring(1)
                valid = true
            }
            inputs.push({valid, ref, offset, semantic})
        }
        return inputs
    }

    public static getSources(doc: Document, inputs: IMeshInput[]): IMeshSource[] {
        return inputs.map(input => {
            if (!input.valid) return { valid: false }
            let source = doc.getElementById(input.ref)
            if (!source) return { valid: false }

            if (input.semantic === 'VERTEX') {
                source = doc.getElementById(source.firstElementChild.getAttribute('source').substring(1))
            }

            const floatArrEl = source.getElementsByTagName('float_array')[0]
            const arrayStr = floatArrEl.textContent.split(' ')
            const count = parseInt(floatArrEl.getAttribute('count'), 10)
            const stride = parseInt(source.getElementsByTagName('technique_common')[0]
                .getElementsByTagName('accessor')[0]
                .getAttribute('stride'), 10)
            const array = new Float32Array(count)

            arrayStr.forEach((x, i) => {
                if (i >= count) return
                let f = parseFloat(x)
                if (!f) f = 0
                array[i] = f
            })

            return {
                valid: true,
                array,
                count,
                stride
            }
        })
    }

    public static async load(src: string): Promise <ColladaResource> {
        return new ColladaResource(src)
    }

}
