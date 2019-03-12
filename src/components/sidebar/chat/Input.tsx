import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Button from '../../shared/Button'
import style from './style.css'

@inject('game')
@observer
export default class Input extends Component<{ game?: GameStore }> {
    public submit = (evt) => {
        evt.preventDefault()
        const message = evt.target.elements.message.value
        if (message.length > 0) {
            GameManager.instance.send(message)
            evt.target.reset()
        }
    }

    public render({ game }) {
        return (
            <form
                  class={style.form + ' ' + (game.connection.validUser ? '' : style.disabled)}
                  onSubmit={this.submit}
            >
                <input name="message" autocomplete="off" placeholder="message" />
                <Button large={true} submit={true} label="send" />
            </form>
        )
    }
}
