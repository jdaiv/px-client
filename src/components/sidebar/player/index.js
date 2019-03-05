import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import style from './style'
import Services from '../../../services'

@inject('ui')
@inject('auth')
@observer
export default class Player extends Component {
    render({ ui, auth }) {
        let equipped = []
        let bag = []
        let skills = []

        const gs = ui.gameState

        if (gs.player) {
            for (let key in gs.player.slots) {
                equipped.push(<Gear item={{ ...gs.player.slots[key], key, equipped: true }} />)
            }
        }

        if (gs.player) {
            for (let key in gs.player.inventory) {
                bag.push(<Gear item={{ ...gs.player.inventory[key], bag: true }} />)
            }
        }

        // skills.push(<Gear item={{ name: 'fightin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'defendin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'thinkin\'', qty: 3 }} />)

        let combatInfo = []
        if (gs.zone && gs.zone.combatInfo) {
            const ci = gs.zone.combatInfo
            combatInfo.push(<p>in combat: {ci.inCombat.toString()}</p>)
            combatInfo.push(<p>turn: {ci.turn}</p>)
            combatInfo.push(<p>current: {ci.current}</p>)
            combatInfo.push(<p>combatants: {JSON.stringify(ci.combatants)}</p>)
        }

        return (
            <div>
                <h2>player: { auth.username }</h2>
                <p>level 0 player</p>
                <Section title="equipped" items={equipped} />
                <Section title="bag" items={bag} />
                <Section title="skills" items={skills} />
                <h2>combat info</h2>
                <p>HP: { gs.player ? gs.player.hp : -99 }</p>
                <p>AP: { gs.player ? gs.player.ap : 0 }</p>
                { combatInfo }
            </div>
        )
    }
}

@observer
class Section extends Component {
    @observable open = false

    toggle = () => {
        this.open = !this.open
    }

    render({ title, items }) {
        return (<div>
            <p><button class={style.toggle} onClick={this.toggle}>[{ this.open ? '-' : '+' }] { title }</button></p>
            { this.open ? items : null }
        </div>)
    }

}

@inject('ui')
@observer
class Gear extends Component {
    equip = () => {
        Services.socket.send('game_action', {
            type: 'equip_item',
            params: {
                id: this.props.item.id
            }
        })
    }
    unequip = () => {
        Services.socket.send('game_action', {
            type: 'unequip_item',
            params: {
                slot: this.props.item.key
            }
        })
    }
    drop = () => {
        Services.socket.send('game_action', {
            type: 'drop_item',
            params: {
                id: this.props.item.id
            }
        })
    }
    use = () => {
        Services.socket.send('game_action', {
            type: 'use_item',
            params: {
                id: this.props.item.id
            }
        })
    }

    @observable statsVisible = false

    showStats = () => {
        this.statsVisible = true
    }

    hideStats = () => {
        this.statsVisible = false
    }

    render({ ui, item }) {
        let classes = []
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
        }

        let hasStats = item.stats && this.statsVisible
        let stats = [<li>quality: { item.quality }</li>]
        if (hasStats) {
            for (let stat in item.stats) {
                stats.push(<li>{ stat }: { item.stats[stat] }</li>)
            }
        }

        let qty = ''
        if (item.qty) {
            qty = `(${item.qty}) `
        }

        let actions = []
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
            { hasStats ? <ul class={style.stats}>{ stats }</ul> : null }
            <p>
                { item.key ? `${item.key}: ` : '' }
                { qty }
                <span class={classes.join(' ')}>{ item.name ? `${item.name}` : 'empty' }</span>
            </p>
            {actions}
        </div>)
    }
}