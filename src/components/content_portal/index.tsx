import { Component, h } from 'preact'
import Engine from '../../engine/Engine'
import style from './style.css'

export default class ContentPortal extends Component {

    private engine: Engine

    public componentDidMount() {
        this.engine = new Engine(this.base)
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
