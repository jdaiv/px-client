import { Component, h } from 'preact'

import style from './Button.css'

interface IButtonProps {
    label: string
    large?: boolean
    submit?: boolean
    class?: string
    onClick?: (arg0: MouseEvent) => void
}

export default class Button extends Component<IButtonProps> {

    public render(props: IButtonProps) {
        const classes = [props.class, style.button]
        if (props.large) classes.push(style.large)
        if (props.submit) {
            return <input class={classes.join(' ')} type="submit" value={props.label} onClick={props.onClick} />
        } else {
            return <button class={classes.join(' ')} onClick={props.onClick}>{ props.label }</button>
        }
    }

}
