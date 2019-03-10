import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../../services'
import SocketStore from '../../stores/SocketStore'
import UIStore from '../../stores/UIStore'
import Button from '../shared/Button'

import style from './style.css'

@inject('socket')
@inject('auth')
@observer
export default class Header extends Component<{ ui?: UIStore; socket?: SocketStore }> {

    private reconnect = () => Services.socket.open(true)
    private logout = () => Services.auth.logout()

    public render({ socket, auth }) {
        return (
            <header class={style.header}>
                <div class={style.status}>
                    {socket.ready ?
                        'connected to server' :
                        <span>
                            <Button label="reconnect" onClick={this.reconnect} />
                            &nbsp;disconnected from server
                        </span>
                    }
                </div>
                <h1>the panic express</h1>
                <div class={style.auth}>
                    {auth.loggedIn ?
                        <span>logged in as {auth.username}</span> :
                        <span>not logged in</span>}
                </div>
            </header>
        )
    }
}