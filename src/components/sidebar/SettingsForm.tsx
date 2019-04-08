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

    private updateSens = (evt: Event) => {
        this.props.game.settings.mouseSensitivity = parseFloat((evt.currentTarget as HTMLInputElement).value)
    }

    private updateFov = (evt: Event) => {
        this.props.game.settings.fov = parseFloat((evt.currentTarget as HTMLInputElement).value)
    }

    public render({ game }) {
        return (
            <div class={style.form}>
                <h2>app settings</h2>
                <p>quality: {8 - game.settings.quality}</p>
                <input type="range" min="1" max="8" value={game.settings.quality} onChange={this.updateQuality} />
                <p>mouse sensitivity: {game.settings.mouseSensitivity}</p>
                <input
                    type="range"
                    min="0.1"
                    max="4"
                    step="0.05"
                    value={game.settings.mouseSensitivity}
                    onChange={this.updateSens}
                />
                <p>fov: {game.settings.fov}</p>
                <input
                    type="range"
                    min="60"
                    max="120"
                    step="1"
                    value={game.settings.fov}
                    onChange={this.updateFov}
                />
            </div>
        )
    }
}
