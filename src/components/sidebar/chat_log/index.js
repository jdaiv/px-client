import { h, Component } from 'preact'
import style from './style'

import EventManager from '../../../services/EventManager'
import Services from '../../../services'

export default class ChatLog extends Component {

    componentDidMount() {
        EventManager.subscribe('chat_update', 'chat_log', ((data) => {
            this.forceUpdate()
            this.bottom.scrollIntoView({ behavior: 'smooth' })
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('chat_update', 'chat_log')
    }

    render ({ target }) {
        const chatlog = Services.chat.rooms[target] ? Services.chat.rooms[target].log.map((msg) => {
            return <div>({msg.timestamp.toLocaleTimeString()}) {msg.from}: {msg.content}</div>
        }) : ''

        return (
            <div class={style.log}>
                {chatlog}
                <div ref={(el) => {this.bottom = el}} />
            </div>
        )
    }

}
