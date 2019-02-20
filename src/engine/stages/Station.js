import { vec3 } from 'gl-matrix'

import Stage from '../Stage'
import Entity from '../Entity'
import { NOTE_MAP } from '../audio/Notes'
import Resources from '../Resources'
import MaterialManager from '../MaterialManager'
import Util from '../Util'
import { GLObject3DTextured } from '../Video'
import Sprite3D from '../components/Sprite3D'
import Mesh3D from '../components/Mesh3D'

const OFFSET = -24

const NOTES = [
    'E5', null, null, null,
    null, null, 'A5', 'C6',
    'B5', null, 'A5', null,
    'A4', null, 'F5', null,
    'E5', null, null, null,
    null, null, 'D5', 'C5',
    'B4', null, null, null,
    'E5', null, null, null,
    'E5', null, null, null,
    null, null, 'A5', 'C6',
    'B5', null, 'A5', null,
    'A4', null, 'F5', null,
    'E5', null, null, null,
    null, null, 'D5', 'C5',
    'G#5', null, null, null,
    'E5', null, null, null,

    'E5', null, null, null,
    null, null, 'D5', 'C5',
    'G5', null, null, null,
    'C5', null, null, null,
    'D5', null, null, null,
    null, null, 'E5', 'F5',
    'E5', null, null, null,
    'D5', null, null, null,
    'C5', 'B4', 'A4', 'B4',
    'C5', null, null, null,
    'F5', null, null, null,
    'E5', null, null, null,
    'G#5', null, null, null,
    'B5', null, null, null,
    'F6', null, null, null,
    'E6', null, null, null,
]

export default class Station extends Stage {

    constructor (engine) {
        super(engine)

        this.trainSign = this.makeSprite('trainSign', 'trainSign', 0, 32, 0 + OFFSET)

        this.noteTimer = 0
        this.noteCount = 0

        // this.makeSprite('fence', 'fence', 0, 0, 0 + OFFSET)
        // this.makeSprite('bin', 'bin', 8, 0, 12)
        // this.makeSprite('seat', 'seat', 0, 0, 13 + OFFSET)
        this.makeSprite('door', 'door', 0, -32, 17)
        this.makeSprite('posters', 'posters', 0, -12, -17)
        this.makeSprite('poses', 'poses', 0, 0, 0)
        this.makeSprite('faces', 'faces', 0, 8, 1)
        this.makeSprite('faces', 'faces', 0, 8, -1)

        this.object = new GLObject3DTextured(MaterialManager.materials.defaultSprite)
        // const cubeSize = 16
        // let cube = Util.makeCube(-cubeSize, -cubeSize - cubeSize, -cubeSize, cubeSize, cubeSize - cubeSize, cubeSize)
        let cube = Util.readObj(Resources.texts.model_arcadecab)
        console.log(cube)
        this.object.setVerts(cube.verts)
        this.object.setUVs(cube.uvs)
        this.object.setTexture(Resources.images.arcadecab.tex)

        this.trainTarget = 0
    }

    makeSprite (name, imgName, x = 0, y = 0, z = 0) {
        const ent = new Entity(this.engine, name)
        ent.transform.position[0] = x
        ent.transform.position[1] = y
        ent.transform.position[2] = z
        ent.addComponent('v', new Sprite3D(Resources.images[imgName]))
        this.addEntity(ent)
        return ent
    }

    tick (dt) {
        super.tick(dt)

        // this.noteTimer -= dt
        // if (this.noteTimer <= 0) {
        //     let note = NOTES[this.noteCount % NOTES.length]
        //     if (note !== null) this.engine.synth.channels[this.noteCount % this.engine.synth.channels.length].playNote(NOTE_MAP[note])
        //     this.noteCount++
        //     this.noteTimer += 0.15
        // }

        // let pos = vec3.clone(this.train.position)

        // pos[0] = this.trainTarget

        // this.train.position = vec3.lerp(
        //     this.train.position,
        //     this.train.position,
        //     pos,
        //     dt
        // )

        // let signPos = vec3.clone(this.train.position)
        // signPos[2] += 16
        // signPos[1] += 18
        // this.trainSign.position = signPos
    }

    draw (dt) {
        super.draw(dt)
        this.engine.v.draw(this.object)
    }

}