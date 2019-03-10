import { Component, h } from 'preact'

import style from './style.css'

export default class StatBar extends Component<{ label: string, min: number, max: number }> {

    public render({ label, min, max }) {
        const width = Math.round((min / max) * 100)

        return (
            <div class={style.statBar}>
                <div class={style.statBarInner} style={`width: ${width}%;`}>&nbsp;</div>
                <div class={style.statBarLabel}>{ label }: { min } / { max }</div>
            </div>
        )
    }

}