import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import style from './style'
import Services from '../../../services';

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

        return (
            <div>
                <h2>{ auth.username }</h2>
                <p>level 0 player</p>
                <Section title="equipped" items={equipped} />
                <Section title="bag" items={bag} />
                <Section title="skills" items={skills} />
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

    render({ ui, item }) {
        let classes = []
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
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
        return (<div class={style.invItem}>
            <p class={classes.join(' ')}>
                { item.key ? `${item.key}: ` : '' }
                { qty }
                { item.name ? `${item.name}` : 'empty' }
            </p>
            {actions}
        </div>)
    }
}