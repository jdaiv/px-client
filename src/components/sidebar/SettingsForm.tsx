import { action } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import UIStore from '../../stores/UIStore'

import style from './style.css'

@inject('ui')
@observer
export default class SettingsForm extends Component<{ ui?: UIStore }> {

    private updateQuality = (evt: Event) => {
        this.props.ui.quality = parseInt((evt.currentTarget as HTMLInputElement).value, 10)
    }

    public render({ ui }) {
        return (
            <div class={style.form}>
                <h2>app settings</h2>
                <p>quality</p>
                <input type="range" min="1" max="8" value={ui.quality} onChange={this.updateQuality} />
            </div>
        )
    }
}
