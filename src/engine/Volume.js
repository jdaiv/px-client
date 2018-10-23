export default class Volume {

    constructor () {
        this.boxes = []
        this.verts = []
        this.colors = []
    }

    box (x, y, z, w, h, d, color = 1, sides = [1, 1, 1, 1, 1, 1]) {
        this.boxes.push({ x, y, z, w, h, d, color, sides, outline: false })
        return this
    }

    outline (color = -1, sides = null) {
        const b = this.boxes[this.boxes.length - 1]
        this.boxes.push({
            x: b.x - 0.5,
            y: b.y - 0.5,
            z: b.z - 0.5,
            w: b.w + 1,
            h: b.h + 1,
            d: b.d + 1,
            color,
            sides: sides === null ? b.sides : sides,
            outline: true
        })
        return this
    }

    finalize () {
        const colors = {
            1: [0, 0, 0],
            2: [0, 255, 0],
            3: [0, 0, 255],
            4: [255, 0, 0]
        }
        this.boxes.forEach(b => {
            if (b.color == 0) return
            const color = colors[Math.abs(b.color)]
            this.makeCube(
                b.x, b.y, b.z,
                b.x + b.w, b.y + b.h, b.z + b.d,
                color[0], color[1], color[2],
                b.color < 0, b.sides)
        })
    }

    makeCube (x0, y0, z0, x1, y1, z1, r, g, b, flipped, sides) {
        let verts = [
            x0, y0, z0, // 0
            x1, y0, z0,
            x1, y1, z0, // 2
            x0, y1, z0,
            x0, y1, z1, // 4
            x1, y1, z1,
            x1, y0, z1, // 6
            x0, y0, z1,
        ]

        let tris = []
        if (sides[0]) tris.push(0, 2, 1, 0, 3, 2) // front
        if (sides[1]) tris.push(2, 3, 4, 2, 4, 5) // top
        if (sides[2]) tris.push(1, 2, 5, 1, 5, 6) // right
        if (sides[3]) tris.push(0, 7, 4, 0, 4, 3) // left
        if (sides[4]) tris.push(5, 4, 7, 5, 7, 6) // back
        if (sides[5]) tris.push(0, 6, 7, 0, 1, 6) // bottom

        if (flipped) {
            tris.reverse()
        }

        tris.forEach(t => {
            this.verts.push(verts[t * 3], verts[t * 3 + 1], verts[t * 3 + 2])
        })

        for (let i = 0; i < tris.length; i++)
            this.colors.push(r, g, b, 255)
    }

}