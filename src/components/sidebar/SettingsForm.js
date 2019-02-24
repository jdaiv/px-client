import { h, Component } from 'preact'
import { action } from 'mobx'
import { inject, observer } from 'mobx-preact'

import style from './style'

@inject('ui')
@observer
export default class SettingsForm extends Component {

    @action
    updateQuality = (evt) => {
        this.props.ui.quality = parseInt(evt.currentTarget.value, 10)
    }

    render ({ ui }) {
        return (
            <div class={style.form}>
                <h2>app settings</h2>
                <p>quality</p>
                <input type="range" min="1" max="8" value={ui.quality} onChange={this.updateQuality} />
            </div>
        )
    }
}