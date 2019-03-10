import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import UIStore from '../../stores/UIStore'

import Engine from '../../engine/Engine'

import style from './style.css'

@inject('ui')
@observer
export default class ContentPortal extends Component<{ ui?: UIStore }> {

    private engine: Engine

    public componentDidMount() {
        this.engine = new Engine(this.base, this.props.ui)
    }

    public componentWillUnmount() {
        this.engine.destroy()
    }

    public render() {
        return (
            <div class={style.portal} />
        )
    }

}
