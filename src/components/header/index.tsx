import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import Button from '../shared/Button'
import style from './style.css'

@inject('game')
@observer
export default class Header extends Component<{ game?: GameStore }> {

    // private reconnect = () => Services.socket.open(true)
    // private logout = () => Services.auth.logout()

    public render({ game }) {
        return (
            <header class={style.header}>
                <div class={style.status}>
                    {game.connection.connected ?
                        'connected to server' :
                        <span>
                            {/* <Button label="reconnect" onClick={this.reconnect} /> */}
                            &nbsp;disconnected from server
                        </span>
                    }
                </div>
                <h1>the panic express</h1>
                <div class={style.auth}>
                    {game.connection.validUser ?
                        <span>logged in as {game.user.username}</span> :
                        <span>not logged in</span>}
                </div>
            </header>
        )
    }
}
