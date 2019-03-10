import { observable } from 'mobx'
import { observer } from 'mobx-preact'
import { Component, h } from 'preact'

import style from './style.css'

@observer
export default class ToggleSection extends Component<{ title: string, open?: boolean }> {
    @observable public open = false

    public toggle = () => {
        this.open = !this.open
    }

    public componentWillMount() {
        this.open = this.props.open
    }

    public render({ title, items }) {
        return (<div>
            <p><button class={style.toggle} onClick={this.toggle}>[{ this.open ? '-' : '+' }] { title }</button></p>
            { this.open ? this.props.children : null }
        </div>)
    }

}