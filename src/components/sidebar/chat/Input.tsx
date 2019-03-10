import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../../../services'
import AuthStore from '../../../stores/AuthStore'

import Button from '../../shared/Button';
import style from './style.css'

@inject('auth')
@observer
export default class Input extends Component<{ auth?: AuthStore }> {
    public submit = (evt) => {
        evt.preventDefault()
        const message = evt.target.elements.message.value
        if (message.length > 0) {
            Services.send(message)
            evt.target.reset()
        }
    }

    public render({ auth }) {
        return (
            <form class={style.form + ' ' + (auth.loggedIn ? '' : style.disabled)} onSubmit={this.submit}>
                <input name="message" autocomplete="off" placeholder={(auth.loggedIn ? 'message' : 'log in first')} />
                <Button large={true} submit={true} label="send" />
            </form>
        )
    }
}
