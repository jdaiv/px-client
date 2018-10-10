import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import style from './style'

// import EventManager from '../../services/EventManager'
// import Services from '../../services'

const CARDS = [
    {
        title: 'wack'
    },
    {
        title: 'wack'
    },
]

@inject('rooms')
@inject('auth')
@observer
export default class BootlegHearthstone extends Component {

    componentDidMount() {

    }

    shouldComponentUpdate() {
        return false
    }

    componentWillUnmount() {

    }

    render({ auth }) {
        return (
            <div class={style.container}>
                {CARDS.map(c => (<div class={style.card}>
                    {c.title}
                </div>))}
            </div>
        )
    }

}