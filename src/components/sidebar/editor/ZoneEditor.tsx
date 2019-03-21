import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import style from './style.css'

@inject('game')
@observer
export default class ZoneEditor extends Component<{ game?: GameStore }> {

    private zoneSelector: any

    private updateTile = (v: number) => {
        this.props.game.editor.activeTile = v
    }

    private updateName = (evt: Event) => {
        evt.preventDefault()
    }

    private newZone = () => {
        GameManager.instance.editAction({ type: 'zone_create' })
    }

    private gotoZone = () => {
        GameManager.instance.editAction({ type: 'zone_goto', zone: parseInt(this.zoneSelector.value, 10) })
    }

    public render({ game }) {
        const zones = []
        for (const key in game.state.allZones) {
            zones.push(<option value={key}>{game.state.allZones[key]}</option>)
        }
        const zoneSelector = (
            <select ref={x => this.zoneSelector = x}>
                {zones}
            </select>
        )
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
                <Button large={true} label="new zone" onClick={this.newZone} />
                <h3>current zone</h3>
                <form onSubmit={this.updateName}>
                    <input placeholder="zone name" value={game.state.zoneName} />
                    <Button submit={true} large={true} label="update" />
                </form>
                <h3>select tile</h3>
                <div class={style.tileSelector}>
                    {buttons}
                </div>
                <h3>goto zone</h3>
                {zoneSelector}
                <Button large={true} label="go" onClick={this.gotoZone} />
            </div>
        )
    }

}
