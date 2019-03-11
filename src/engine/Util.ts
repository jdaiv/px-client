
export default class Util {

    public static makeCube(x0, y0, z0, x1, y1, z1) {
        const verts = [
            x0, y0, z0, // 0
            x1, y0, z0,
            x1, y1, z0, // 2
            x0, y1, z0,
            x0, y1, z1, // 4
            x1, y1, z1,
            x1, y0, z1, // 6
            x0, y0, z1,
        ]

        const uvs = [
            0, 1,
            1, 1,
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            1, 0,
            0, 0,
        ]

        const tris = [
            0, 2, 1, 0, 3, 2, // front
            2, 3, 4, 2, 4, 5, // top
            1, 2, 5, 1, 5, 6, // right
            0, 7, 4, 0, 4, 3, // left
            5, 4, 7, 5, 7, 6, // back
            0, 6, 7, 0, 1, 6, // bottom
        ]

        let _verts = []
        let _uvs = []

        tris.forEach(t => {
            _verts.push(verts[t * 3], verts[t * 3 + 1], verts[t * 3 + 2])
            _uvs.push(uvs[t * 2], uvs[t * 2 + 1])
        })

        return {
            verts: _verts,
            uvs: _uvs
        }
    }

    public static readObj(objFile, scale = 8) {
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