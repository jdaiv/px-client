import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import { SPRITES } from '../../config/resources'
import GameStore from '../../shared/GameStore'
import StatBar from '../shared/StatBar'
import style from './style.css'

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
                <StatBar label="HP" min={player.hp} max={player.maxHP} color={[255, 0, 0]} />
                <div style="flex: 1" />
                <div
                    class={style.spellBtn + ' ' + (game.state.combat.activeSpell === '' ? style.active : '')}
                    style={`background-image: url(${SPRITES.sword.file})`}
                >
                    &nbsp;
                </div>
                <div
                    class={style.spellBtn + ' ' + (game.state.combat.activeSpell === 'fireball' ? style.active : '')}
                    style={`background-image: url(${SPRITES.fireball.file})`}
                >
                    &nbsp;
                </div>
                <div
                    class={style.spellBtn + ' ' + (game.state.combat.activeSpell === 'icebolt' ? style.active : '')}
                    style={`background-image: url(${SPRITES.icebolt.file})`}
                >
                    &nbsp;
                </div>
                <div
                    class={style.spellBtn + ' ' + (game.state.combat.activeSpell === 'thunderbolt' ? style.active : '')}
                    style={`background-image: url(${SPRITES.thunderbolt.file})`}
                >
                    &nbsp;
                </div>
                <div style="flex: 1" />
                <StatBar label="AP" min={player.ap} max={player.maxAP} color={[0, 255, 0]} />
                <StatBar label="MP" min={player.mp || 0} max={player.maxMP || 0} color={[0, 0, 255]} />
            </div>
        )
    }

}
