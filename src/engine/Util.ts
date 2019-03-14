
export default class Util {

    public static makeQuad(x0: number, y0: number, x1: number, y1: number, count = 1) {
        const verts = [
            x0, y0, 0,
            x1, y0, 0,
            x1, y1, 0,
            x0, y1, 0,
        ]

        const uvs = [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
        ]

        const tris = [
            0, 1, 2, 0, 2, 3, // front
        ]

        const processedVerts = []
        const processedUvs = []

        for (let i = 0; i < count; i++) {
            tris.forEach(t => {
                processedVerts.push(verts[t * 3], verts[t * 3 + 1], verts[t * 3 + 2])
                processedUvs.push(uvs[t * 2], uvs[t * 2 + 1])
            })
        }

        return {
            verts: processedVerts,
            uvs: processedUvs
        }
    }

    public static readObj(objFile: string, scale = 8) {
        const verts = []
        const uvs = []
        const tris = []
        const normals = []
        let _verts = []
        let _uvs = []
        let _normals = []

        const lines = objFile.split('\n')
        lines.forEach(l => {
            const parts = l.split(' ')
            switch (parts[0]) {
            case 'v':
                verts.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3]))
                break
            case 'vn':
                normals.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3]))
                break
            case 'vt':
                uvs.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]))
                break
            case 'f':
                tris.push(parts[1], parts[2], parts[3])
                break
            }
        })

        tris.forEach(t => {
            const indices = t.split('/')
            const v = (parseInt(indices[0], 10) - 1) * 3
            const n = (parseInt(indices[2], 10) - 1) * 3
            const uv = (parseInt(indices[1], 10) - 1) * 2
            _verts.push(verts[v] * scale, verts[v + 1] * scale, verts[v + 2] * scale)
            _normals.push(normals[n], normals[n + 1], normals[n + 2])
            _uvs.push(uvs[uv], 1 - uvs[uv + 1])
        })

        return {
            verts: _verts,
            uvs: _uvs,
            normals: _normals
        }
    }

}
