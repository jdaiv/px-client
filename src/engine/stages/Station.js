import Stage from '../Stage'
import Resources from '../Resources'
import MaterialManager from '../MaterialManager'
import Util from '../Util'
import { GLObject3D } from '../Video'
import Player from '../entities/Player'
import Services from '../../services'

export default class Station extends Stage {

    data = null

    constructor (engine) {
        super(engine)

        this.object = new GLObject3D(MaterialManager.materials.defaultSprite)
        // const cubeSize = 16
        // let cube = Util.makeCube(-cubeSize, -cubeSize - cubeSize, -cubeSize, cubeSize, cubeSize - cubeSize, cubeSize)
        let cube = Util.readObj(Resources.texts.model_cube, 8)
        this.object.setVerts(cube.verts)
        this.object.setUVs(cube.uvs)
        this.object.setNormals(cube.normals)
        this.object.setTexture(Resources.images.grid.tex)

        this.cab = new GLObject3D(MaterialManager.materials.defaultSprite)
        let cab = Util.readObj(Resources.texts.model_arcadecab, 8)
        this.cab.setVerts(cab.verts)
        this.cab.setUVs(cab.uvs)
        this.cab.setNormals(cab.normals)
        this.cab.setTexture(Resources.images.arcadecab.tex)
        this.cab.position = [32, 0, -16]

        this.addEntity(new Player('player'))

        Services.getGameState().then(data => this.data = data)
    }

    tick (dt) {
        super.tick(dt)
    }

    draw (dt) {
        super.draw(dt)

        // this.object.cull = -1
        // this.object.material = MaterialManager.materials.outline
        this.object.cull = 1
        this.object.material = MaterialManager.materials.defaultSprite

        const tileSize = 16
        if (this.data) {
            this.data.Map.forEach((t, i) => {
                this.object.position = [
                    Math.floor(i % this.data.Width) * tileSize,
                    -tileSize / 2 + (t.Type == 'grass' ? 1 : 0),
                    Math.floor(i / this.data.Width) * tileSize,
                ]
                this.engine.v.draw(this.object)
            })
        }

        this.cab.cull = -1
        this.cab.material = MaterialManager.materials.outline
        this.engine.v.draw(this.cab)
        this.cab.cull = 1
        this.cab.material = MaterialManager.materials.defaultSprite
        this.engine.v.draw(this.cab)
    }

}