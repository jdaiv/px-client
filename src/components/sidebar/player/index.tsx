import { observable } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../../../services'
import AuthStore from '../../../stores/AuthStore'
import UIStore from '../../../stores/UIStore'
import ItemLabel from '../../shared/ItemLabel'
import ToggleSection from '../../shared/ToggleSection'

import style from './style.css'

@inject('ui')
@inject('auth')
@observer
export default class Player extends Component<{ ui?: UIStore; auth?: AuthStore }> {
    public render({ ui, auth }) {
        let health = []
        const stats = []
        const equipped = []
        const bag = []
        const skills = []

        const gs = ui.gameState

        if (gs.player) {
            health = [
                <p class={style.invItem}>HP: {gs.player.hp} / {gs.player.maxHP}</p>,
                <p class={style.invItem}>AP: {gs.player.ap} / {gs.player.maxAP}</p>
            ]
            for (const key in gs.player.stats) {
                if (gs.player.stats[key] > 0)
                    stats.push(<p class={style.invItem}>{key}: {gs.player.stats[key]}</p>)
            }
            for (const key in gs.player.slots) {
                equipped.push(
                    <Gear item={{ ...gs.player.slots[key], key, equipped: true }} />)
            }
            for (const key in gs.player.inventory) {
                bag.push(
                    <Gear item={{ ...gs.player.inventory[key], bag: true }} />)
            }
        }

        // skills.push(<Gear item={{ name: 'fightin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'defendin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'thinkin\'', qty: 3 }} />)

        const combatInfo = []
        if (gs.zone && gs.zone.combatInfo && gs.zone.combatInfo.inCombat) {
            const ci = gs.zone.combatInfo
            combatInfo.push(<h2>combat!</h2>)
            combatInfo.push(<p class={style.invItem}>in combat: {ci.inCombat.toString()}</p>)
            combatInfo.push(<p class={style.invItem}>turn: {ci.turn}</p>)
            combatInfo.push(<p class={style.invItem}>combatants:</p>)
            ci.combatants.forEach((c, i) => {
                const actor = c.isPlayer ?  gs.zone.players[c.id] : gs.zone.npcs[c.id]
                combatInfo.push(<p class={style.invItem}>({i == ci.current ? '+' : ' '}) {actor.name}</p>)
            })
        }

        return (
            <div>
                <h2 class={style.heading}>player: { auth.username }</h2>
                <p>level 0 player</p>
                { health }
                <ToggleSection title="stats">{ stats }</ToggleSection>
                <ToggleSection title="equipped" open={true}>{ equipped }</ToggleSection>
                <ToggleSection title="bag">{ bag }</ToggleSection>
                <ToggleSection title="skills">{ skills }</ToggleSection>
                { combatInfo }
            </div>
        )
    }
}

@inject('ui')
@observer
class Gear extends Component<{ ui?: UIStore, item: any }> {
    private equip = () => {
        Services.socket.send('game_action', {
            type: 'equip_item',
            params: {
                id: this.props.item.id
            }
        })
    }
    private unequip = () => {
        Services.socket.send('game_action', {
            type: 'unequip_item',
            params: {
                slot: this.props.item.key
            }
        })
    }
    private drop = () => {
        Services.socket.send('game_action', {
            type: 'drop_item',
            params: {
                id: this.props.item.id
            }
        })
    }
    private use = () => {
        Services.socket.send('game_action', {
            type: 'use_item',
            params: {
                id: this.props.item.id
            }
        })
    }

    @observable public statsVisible = false

    private showStats = () => {
        this.statsVisible = true
    }

    private hideStats = () => {
        this.statsVisible = false
    }

    public render({ ui, item }) {
        const classes = []
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
        }

        const stats = [<li>quality: { item.quality }</li>, <li>value: { item.price || '0' }g</li>]
        if (item.stats && Object.keys(item.stats).length > 0) {
            stats.push(<li><em>- stats -</em></li>)
            for (const stat in item.stats) {
                stats.push(<li>&nbsp;&nbsp;{ stat }: { item.stats[stat] }</li>)
            }
        }
        if (item.specials && Object.keys(item.specials).length > 0) {
            stats.push(<li><em>- special -</em></li>)
            for (const s in item.specials) {
                stats.push(<li>&nbsp;&nbsp;{ item.specials[s] }</li>)
            }
        }

        const actions = []
        if (item.equipped && item.type != 'empty') {
            actions.push(<button class={style.invAction} onClick={this.unequip}>unequip</button>)
        } else if (item.bag) {
            actions.push(<button class={style.invAction} onClick={this.equip}>equip</button>)
            actions.push(<button class={style.invAction} onClick={this.drop}>drop</button>)
        }
        if (Array.isArray(item.specials) && item.specials.includes('consumable')) {
            actions.push(<button class={style.invAction} onClick={this.use}>use</button>)
        }
        return (<div class={style.invItem} onMouseOver={this.showStats} onMouseOut={this.hideStats}>
            { item.type !== 'empty' && this.statsVisible ? <ul class={style.stats}>{ stats }</ul> : null }
            <p>
                { item.key ? `${item.key}: ` : '' }
                <ItemLabel item={item} />
            </p>
            {actions}
        </div>)
    }
}
