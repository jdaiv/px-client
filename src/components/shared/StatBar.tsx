import { Component, h } from 'preact'

import style from './style.css'

export default class StatBar extends Component<{ label: string, min: number, max: number, small?: boolean }> {

    public render({ label, min, max, small }) {
        const width = Math.round((min / max) * 100)
        const classes = [style.statBar]
        if (small) classes.push(style.small)

        return (
            <div class={classes.join(' ')} style={`background: linear-gradient(to right, #030 ${width}%, #000 ${width}%);`}>
                <div style="float: right">{ min } / { max }</div>
                { label }
            </div>
        )
    }

}