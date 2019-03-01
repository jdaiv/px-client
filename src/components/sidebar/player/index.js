import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import style from './style'

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
                equipped.push(<Gear item={{ ...gs.player.slots[key], key }} />)
            }
        }

        if (gs.player) {
            for (let key in gs.player.inventory) {
                bag.push(<Gear item={{ ...gs.player.inventory[key] }} />)
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
    render({ ui, item }) {
        let classes = [style.invItem]
        if (!isNaN(item.quality) && item.quality >= 1 && item.quality <= 6) {
            classes.push(style['quality' + Math.floor(item.quality)])
        }
        let qty = ''
        if (item.qty) {
            qty = `(${item.qty}) `
        }
        return (
            <p class={classes.join(' ')}>
                { item.key ? `${item.key}: ` : '' }
                { qty }
                { item.name ? `${item.name}` : 'empty' }
            </p>
        )
    }
}