import { Component, h } from 'preact'

import style from './Tabs.css'

interface ITabProps {
    active?: string
    options: string[]
    onClick: (arg0: string) => void
}

export default class Tabs extends Component<ITabProps> {

    private click = (o: string) => {
        this.props.onClick(o)
    }

    public render(props: ITabProps) {
        const children = []
        props.options.forEach(o => {
            children.push(
                <button class={props.active === o ? style.active : ''} onClick={() => this.click(o)}>{o}</button>
            )
        })
        return <nav class={style.tabs}>{children}</nav>
    }

}
