import { Component, h } from 'preact'

import style from './style.css'

export default class StatBar extends Component<{ label: string, min: number, max: number,
    small?: boolean, color?: [number, number, number] }> {

    public render({ label, min, max, small, color }) {
        let width = Math.round((min / max) * 100)
        if (isNaN(width)) {
            width = 0
        }
        const classes = [style.statBar]
        if (small) classes.push(style.small)

        const c = `${color[0]}, ${color[1]}, ${color[2]}` || '0, 255, 0'
        const s =
            `background: linear-gradient(to top, rgba(${c}, 0.2) ${width}%, rgba(${c}, 0.05) ${width}%), #000;` +
            `border-color: rgb(${c})`

        return (
            <div
                class={classes.join(' ')}
                style={s}
            >
                <div style="float: right"><strong>{min || '0'}</strong> / {max}</div>
                {label}
            </div>
        )
    }

}
