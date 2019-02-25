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

        equipped.push(<Gear item={{ name: 'gear', quality: 1 }} />)
        equipped.push(<Gear item={{ name: 'gear', quality: 2 }} />)
        equipped.push(<Gear item={{ name: 'gear', quality: 3 }} />)

        bag.push(<Gear item={{ name: 'gear', quality: 4, qty: 3 }} />)
        bag.push(<Gear item={{ name: 'gear', quality: 5 }} />)
        bag.push(<Gear item={{ name: 'gear', quality: 6 }} />)

        skills.push(<Gear item={{ name: 'fightin\'', qty: 3 }} />)
        skills.push(<Gear item={{ name: 'defendin\'', qty: 3 }} />)
        skills.push(<Gear item={{ name: 'thinkin\'', qty: 3 }} />)

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
            <p><button class={style.toggle} onClick={this.toggle}>[{ this.open ? '-' : '+' }]</button> { title }</p>
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
            qty = `(${item.qty})`
        }
        return (
            <p class={classes.join(' ')}>{ qty } { item.name }</p>
        )
    }
}