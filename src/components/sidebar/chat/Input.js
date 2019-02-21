import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import style from './style'

import Services from '../../../services'

@inject('auth')
@observer
export default class Input extends Component {
    submit = (evt) => {
        evt.preventDefault()
        const message = evt.target.elements.message.value
        if (message.length > 0) {
            Services.send(message)
            evt.target.reset()
        }
    }

    render({ auth }) {
        return (
            <form class={style.form + ' ' + (auth.loggedIn ? '' : style.disabled)} onSubmit={this.submit}>
                <input name="message" autocomplete="off" placeholder={(auth.loggedIn ? 'message' : 'log in first')} />
                <input class="button" type="submit" value="send" />
            </form>
        )
    }
}