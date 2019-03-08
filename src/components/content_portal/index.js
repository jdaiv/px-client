import { h, Component } from 'preact'
import { observer, inject } from 'mobx-preact'

import Engine from '../../engine/Engine'

import style from './style'

@inject('ui')
@observer
export default class ContentPortal extends Component {

    componentDidMount() {
        this.engine = new Engine(this.base, this.props.ui)
    }

    componentWillUnmount() {
        this.engine.destroy()
    }

    render({ ui }) {
        return (
            <div class={style.portal} />
        )
    }

}