import { Component, h } from 'preact'

import { observable } from 'mobx'
import style from './Tabs.css'

interface ITabProps {
    active?: string
    options: string[]
    onClick: (arg0: string) => void
}

export default class Tabs extends Component<ITabProps> {

    @observable public active: string
    private click = (o: string) => {
        this.active = o
        this.props.onClick(o)
    }

    public componentWillMount() {
        if (this.props.active) {
            this.active = this.props.active
        } else {
            this.active = this.props.options[0]
        }
    }

    public render(props: ITabProps) {
        const children = []
        props.options.forEach(o => {
            children.push(
                <button class={this.active === o ? style.active : ''} onClick={() => this.click(o)}>{ o }</button>
            )
        })
        return <nav class={style.tabs}>{ children }</nav>
    }

}
