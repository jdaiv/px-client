import { observer } from 'mobx-preact'
import { Component, h } from 'preact'

import style from './style.css'

@observer
export default class Log extends Component<{ log: object[] }> {

    public componentDidUpdate() {
        setTimeout(() => {
            document.getElementById('chat-bottom').scrollIntoView({ behavior: 'smooth' })
        })
    }

    public render({ log }) {
        const messages = log.map((msg, i) =>
            <div key={i} class={msg.notice ? style.notice : style.message}>{msg.content}</div>)

        return (
            <div class={style.log}>
                {messages}
                <div id="chat-bottom" />
            </div>
        )
    }

}
