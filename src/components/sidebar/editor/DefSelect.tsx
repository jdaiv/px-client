import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../../shared/GameStore'
import style from './style.css'

type SelectType = 'zone' | 'npc' | 'entity' | 'item' | 'item_mod' | 'slot'

@inject('game')
@observer
export default class DefSelect extends Component<{ game?: GameStore,
    name: string, type: SelectType, value: string }> {

    public render({ game, name, type, value }) {
        const opts = []
        switch (type) {
            case 'zone':
                for (const key in game.state.allZones) {
                    opts.push(<option value={key}>{game.state.allZones[key]}</option>)
                }
                break
            case 'npc':
                for (const key in game.state.definitions.NPCs) {
                    opts.push(
                        <option value={key}>{game.state.definitions.NPCs[key].DefaultName}</option>)
                }
            case 'entity':
                for (const key in game.state.definitions.Entities) {
                    opts.push(
                        <option value={key}>{game.state.definitions.Entities[key].DefaultName}</option>)
                }
            case 'item':
                for (const key in game.state.definitions.Items) {
                    opts.push(<option value={key}>{game.state.definitions.Items[key].Name}</option>)
                }
                break
            case 'item_mod':
                for (const key in game.state.definitions.ItemMods) {
                    opts.push(
                        <option value={key}>{game.state.definitions.ItemMods[key].Name}</option>)
                }
            case 'slot':
                for (const key in game.state.activePlayer.slots) {
                    opts.push(
                        <option value={key}>{key}</option>)
                }
                break
        }
        return (
            <select value={value} name={name}>
                {opts}
            </select>
        )
    }
}
