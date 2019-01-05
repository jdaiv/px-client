import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import Engine from '../../engine/Engine'

import style from './style'

@inject('rooms')
@observer
export default class ContentPortal extends Component {

    componentDidMount() {
        this.engine = new Engine(this.base)
    }

    componentWillUnmount() {
        this.engine.destroy()
    }

    render({ rooms }) {
        return (
            <div class={style.portal} />
        )
    }

}