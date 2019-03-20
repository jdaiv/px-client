import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import style from './style.css'

@inject('game')
@observer
export default class ZoneEditor extends Component<{ game?: GameStore }> {

    private updateTile = (v: number) => {
        this.props.game.editor.activeTile = v
    }

    public render({ game }) {
        const buttons = []
        for (let i = 0; i < 64; i++) {
            buttons.push((
                <button
                    class={`${style.tileBtn} ${game.editor.activeTile === i ? style.active : ''}`}
                    onClick={this.updateTile.bind(this, i)}
                >
                    &nbsp;
                </button>
            ))
        }
        return (
            <div>
                <h3>zone</h3>
                <form>
                    <input placeholder="zone name" value={game.state.zoneName} />
                    <div class={style.flex}>
                        <input placeholder="width" value={game.state.mapWidth} />
                        <input placeholder="height" value={game.state.mapHeight} />
                        <input placeholder="spawnX" />
                        <input placeholder="spawnY" />
                    </div>
                    <Button large={true} label="update" />
                </form>
                <h3>select tile</h3>
                <div class={style.tileSelector}>
                    {buttons}
                </div>
            </div>
        )
    }

}
