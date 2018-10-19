import { Vector3 } from './Vector'

export default class Volume {

    constructor (x, y, z) {
        this.bounds = new Vector3(x, y, z)
        this.data = new Array(z)
        for (let _z = 0; _z < z; _z++) {
            this.data[_z] = new Array(y)
            for (let _y = 0; _y < y; _y++) {
                this.data[_z][_y] = new Array(x)
                for (let _x = 0; _x < x; _x++) {
                    this.data[_z][_y][_x] = 0
                }
            }
        }
    }

    box (x, y, z, w, h, d, color = 1) {
        for (let _z = z; _z < z + d; _z++) {
            for (let _y = y; _y < y + h; _y++) {
                for (let _x = x; _x < x + w; _x++) {
                    this.data[_z][_y][_x] = color
                }
            }
        }
        return this
    }

    outline (color = -1) {
        const bX = this.bounds.x, bY = this.bounds.y, bZ = this.bounds.z
        for (let _z = 0; _z < bZ; _z++) {
            for (let _y = 0; _y < bY; _y++) {
                for (let _x = 0; _x < bX; _x++) {
                    if (this.data[_z][_y][_x] > 0) continue
                    if (

                        this.data[_z][_y][_x + 1] > 0 ||
                        this.data[_z][_y][_x - 1] > 0 ||

                        ((_y > 0 && _y < bY - 1) && (
                            this.data[_z][_y + 1][_x] > 0 ||
                            this.data[_z][_y - 1][_x] > 0 ||
                            this.data[_z][_y - 1][_x - 1] > 0 ||
                            this.data[_z][_y - 1][_x + 1] > 0 ||
                            this.data[_z][_y + 1][_x - 1] > 0 ||
                            this.data[_z][_y + 1][_x + 1] > 0
                        ))

                        ||

                        ((_z > 0 && _z < bZ - 1) && (
                            this.data[_z + 1][_y][_x] > 0 ||
                            this.data[_z - 1][_y][_x] > 0 ||
                            this.data[_z - 1][_y][_x - 1] > 0 ||
                            this.data[_z - 1][_y][_x + 1] > 0 ||
                            this.data[_z + 1][_y][_x - 1] > 0 ||
                            this.data[_z + 1][_y][_x + 1] > 0

                            ||

                            ((_y > 0 && _y < bY - 1) && (
                                this.data[_z - 1][_y - 1][_x] > 0 ||
                                this.data[_z + 1][_y - 1][_x] > 0 ||
                                this.data[_z - 1][_y + 1][_x] > 0 ||
                                this.data[_z + 1][_y + 1][_x] > 0 ||
                                this.data[_z + 1][_y + 1][_x + 1] > 0 ||
                                this.data[_z + 1][_y + 1][_x - 1] > 0 ||
                                this.data[_z + 1][_y - 1][_x - 1] > 0 ||
                                this.data[_z - 1][_y - 1][_x - 1] > 0 ||
                                this.data[_z - 1][_y + 1][_x - 1] > 0 ||
                                this.data[_z - 1][_y + 1][_x + 1] > 0 ||
                                this.data[_z + 1][_y - 1][_x + 1] > 0
                            ))
                        ))

                    ) this.data[_z][_y][_x] = color
                }
            }
        }
        return this
    }

}