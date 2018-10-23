import { vec3 } from 'gl-matrix'

import Component from '../Component'

export default class PlayerController extends Component {

    constructor (w, h, d) {
        super()
        this.extents = vec3.set(vec3.create(), w, h, d)
    }

}