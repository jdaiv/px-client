import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../../shared/GameStore'
import baseStyle from '../style.css'
import EntityEditor from './EntityEditor'
import style from './style.css'
import ZoneEditor from './ZoneEditor'

@inject('game')
@observer
export default class Editor extends Component<{ game?: GameStore }> {

    private setMode = (evt: Event) => {
        this.props.game.editor.mode = (evt.currentTarget as HTMLInputElement).value
    }

    private updateEnabled = (evt: Event) => {
        this.props.game.editor.enabled = (evt.currentTarget as HTMLInputElement).checked
    }

    public render({ game }) {

        let inner: any
        switch (game.editor.mode) {
            case 'zone': inner = <ZoneEditor />; break
            case 'entity': inner = <EntityEditor />; break
            case 'item': inner = <ZoneEditor />; break
            case 'npc': inner = <ZoneEditor />; break
        }
        return (
            <div class={baseStyle.form}>
                <h2>editor</h2>
                <div class={style.checkbox}>
                    <label>enabled</label>
                    <input type="checkbox" checked={game.editor.enabled} onChange={this.updateEnabled} />
                </div>
                <p>mode:</p>
                <select onChange={this.setMode} value={game.editor.mode}>
                    <option>zone</option>
                    <option>entity</option>
                    <option>item</option>
                    <option>npc</option>
                </select>
                {inner}
            </div>
        )
    }

}
