import { h, Component } from 'preact'

import style from './style'

import Services from '../../../services'

export default class ChatInput extends Component {
    submit = (evt) => {
        evt.preventDefault()
        const message = evt.target.elements.message.value
        if (message.length > 0) {
            Services.chat.send(this.props.target, message)
            evt.target.reset()
        }
    }

    render() {
        return (
            <form class={style.form} onSubmit={this.submit}>
                <input name="message" autocomplete="off" placeholder="message" />
                <input class="button" type="submit" value="send" />
            </form>
        )
    }
}