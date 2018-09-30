import { h, Component } from 'preact'

import Chat from './chat'

import style from './style'

export default class Sidebar extends Component {
    state = {
        active: false
    }

    toggle = () => {
        this.setState({ active: !this.state.active })
    }

    render({ }, { log, active }) {
        return (
            <div class={style.sidebar}>
                {/* <div class={style.tabs}>
                    <button class="button">public</button>
                    <button class="button">rooms</button>
                    <button class="button">settings</button>
                </div> */}
                <Chat />
            </div>
        )
    }
}