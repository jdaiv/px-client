import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import DefSelect from './DefSelect'
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
        GameManager.instance.editAction({
            type: 'zone_rename',
            name: ((evt.target as Element).querySelector('[name="name"]') as HTMLInputElement).value
        })
    }

    private newZone = () => {
        GameManager.instance.editAction({ type: 'zone_create' })
    }

    private gotoZone = () => {
        GameManager.instance.editAction({ type: 'zone_goto',
            zone: parseInt(this.zoneSelector.base.value, 10) })
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
                <Button large={true} label="new zone" onClick={this.newZone} />
                <h3>current zone</h3>
                <form onSubmit={this.updateName}>
                    <input name="name" placeholder="zone name" value={game.state.zoneName} />
                    <Button submit={true} large={true} label="update" />
                </form>
                <h3>select tile</h3>
                <div class={style.tileSelector}>
                    {buttons}
                </div>
                <h3>goto zone</h3>
                <DefSelect ref={x => this.zoneSelector = x} name="goto_zone" type="zone" value="" />
                <Button large={true} label="go" onClick={this.gotoZone} />
            </div>
        )
    }

}
