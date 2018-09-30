import { h, Component } from 'preact'
import style from './style'

import EventManager from '../../../services/EventManager'
import Services from '../../../services'

export default class Chat extends Component {

    state = {
        activeRoom: 'public'
    }

    submit = (evt) => {
        evt.preventDefault()
        const message = evt.target.elements.message.value
        if (message.length > 0) {
            Services.chat.send(this.state.activeRoom, message)
            evt.target.reset()
        }
    }

    changeRoom = (evt) => {
        this.setState({ activeRoom: evt.target.textContent })
    }

    addRoom = () => {
        Services.chat.joinRoom()
    }

    joinRoom = (evt) => {
        evt.preventDefault()
        const id = evt.target.elements.id.value
        if (id.length > 0) {
            Services.chat.joinRoom(id)
            evt.target.reset()
        }
    }

    componentDidMount() {
        EventManager.subscribe('chat_update', 'chat_log', ((data) => {
            this.forceUpdate()
            this.bottom.scrollIntoView({ behavior: 'smooth' })
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('chat_update', 'chat_log')
    }

    render ({ }, { activeRoom }) {
        const chatlog = Services.chat.rooms[activeRoom] ? Services.chat.rooms[activeRoom].log.map((msg) => {
            return <div>({msg.timestamp.toLocaleTimeString()}) {msg.from}: {msg.content}</div>
        }) : ''
        const tabs = Object.entries(Services.chat.rooms).map((e) => {
            return <button class={(activeRoom == e[0] ? style.active : '') + ' button'} onClick={this.changeRoom}>{e[0]}</button>
        })
        return (
            <div class={style.chat}>
                <div class={style.tabs}>
                    {tabs}
                    <button class="button" onClick={this.addRoom}>add room</button>
                </div>
                <form class={style.form} onSubmit={this.joinRoom}>
                    <input name="id" placeholder="00000000-0000-0000-0000-000000000000" autocomplete="off" />
                    <input class="button" type="submit" value="join room" />
                </form>
                <div class={style.log}>
                    {chatlog}
                    <div ref={(el) => {this.bottom = el}} />
                </div>
                <form class={style.form} onSubmit={this.submit}>
                    <input name="message" autocomplete="off" placeholder="message" />
                    <input class="button" type="submit" value="send" />
                </form>
            </div>
        )
    }

}
