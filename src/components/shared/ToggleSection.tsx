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

        let children = this.props.children
        if (children.length <= 0) {
            children = ['empty']
        }

        return (<div>
            <p class={ this.open ? style.toggleOpen : '' }>
                <button class={style.toggle} onClick={this.toggle}>[{ this.open ? '-' : '+' }] { title }</button>
            </p>
            { this.open ? <div class={style.toggleInner}>{ children }</div> : null }
        </div>)
    }

}