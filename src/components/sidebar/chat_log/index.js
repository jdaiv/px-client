import { h, Component } from 'preact'
import style from './style'
import { observer } from 'mobx-preact'

@observer
export default class ChatLog extends Component {

    componentDidUpdate() {
        setTimeout(() => {
            document.getElementById('chat-bottom').scrollIntoView({ behavior: 'smooth' })
        })
    }

    render ({ log }) {
        return (
            <div class={style.log}>
                {log.map(msg =>
                    <div class={msg.notice ? style.notice : style.message}>{msg.formatted}</div>)}
                <div id="chat-bottom" />
            </div>
        )
    }

}
