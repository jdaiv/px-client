import { action } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import style from './style.css'

@inject('game')
@observer
export default class SettingsForm extends Component<{ game?: GameStore }> {

    private updateQuality = (evt: Event) => {
        this.props.game.settings.quality = parseInt((evt.currentTarget as HTMLInputElement).value, 10)
    }

    public render({ game }) {
        return (
            <div class={style.form}>
                <h2>app settings</h2>
                <p>quality</p>
                <input type="range" min="1" max="8" value={game.settings.quality} onChange={this.updateQuality} />
            </div>
        )
    }
}
