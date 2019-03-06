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
        let health = []
        let stats = []
        let equipped = []
        let bag = []
        let skills = []

        const gs = ui.gameState

        if (gs.player) {
            health = [
                <p class={style.invItem}>HP: {gs.player.hp} / {gs.player.maxHP}</p>,
                <p class={style.invItem}>AP: {gs.player.ap} / {gs.player.maxAP}</p>
            ]
            for (let key in gs.player.stats) {
                if (gs.player.stats[key] > 0)
                    stats.push(<p class={style.invItem}>{key}: {gs.player.stats[key]}</p>)
            }
            for (let key in gs.player.slots) {
                equipped.push(<Gear item={{ ...gs.player.slots[key], key, equipped: true }} />)
            }
            for (let key in gs.player.inventory) {
                bag.push(<Gear item={{ ...gs.player.inventory[key], bag: true }} />)
            }
        }

        // skills.push(<Gear item={{ name: 'fightin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'defendin\'', qty: 3 }} />)
        // skills.push(<Gear item={{ name: 'thinkin\'', qty: 3 }} />)

        let combatInfo = []
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
                <h2>player: { auth.username }</h2>
                <p>level 0 player</p>
                { health }
                <Section title="stats" items={stats} />
                <Section title="equipped" items={equipped} open="true" />
                <Section title="bag" items={bag} />
                <Section title="skills" items={skills} />
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

    componentWillMount() {
        this.open = this.props.open
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

        let stats = [<li>quality: { item.quality }</li>, <li>value: { item.price || '0' }g</li>]
        if (item.stats && Object.keys(item.stats).length > 0) {
            stats.push(<li><em>- stats -</em></li>)
            for (let stat in item.stats) {
                stats.push(<li>&nbsp;&nbsp;{ stat }: { item.stats[stat] }</li>)
            }
        }
        if (item.specials && Object.keys(item.specials).length > 0) {
            stats.push(<li><em>- special -</em></li>)
            for (let s in item.specials) {
                stats.push(<li>&nbsp;&nbsp;{ item.specials[s] }</li>)
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
            { item.type != 'empty' && this.statsVisible ? <ul class={style.stats}>{ stats }</ul> : null }
            <p>
                { item.key ? `${item.key}: ` : '' }
                { qty }
                <span class={classes.join(' ')}>{ item.name ? `${item.name}` : 'empty' }</span>
            </p>
            {actions}
        </div>)
    }
}