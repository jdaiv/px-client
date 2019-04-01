import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import Button from '../shared/Button'
import StatBar from '../shared/StatBar'
import style from './style.css'

// import style from './style.css'

@inject('game')
@observer
export default class ActionBar extends Component<{ game?: GameStore }> {

    public render({ game }) {
        const player = game.state.activePlayer
        if (!player) {
            return <div class={style.bar} />
        }

        return (
            <div class={style.bar}>
                <StatBar key="hp" label="HP" min={player.hp} max={player.maxHP} />
                <StatBar key="ap" label="AP" min={player.ap} max={player.maxAP} />
            </div>
        )
    }

}
