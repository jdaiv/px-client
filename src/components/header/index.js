import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import style from './style'

import Services from '../../services'

@inject('socket')
@inject('auth')
@observer
export default class Header extends Component {

    reconnect = () => Services.socket.open(true)
    logout = () => Services.auth.logout()

    render({ socket, auth }) {
        return (
            <header class={style.header}>
                <div class={style.status}>
                    {socket.ready ?
                        'connected to server' :
                        <span><button class="button" onClick={this.reconnect}>reconnect</button> disconnected from server</span>
                    }
                </div>
                <h1>the panic express</h1>
                <div class={style.auth}>
                    {auth.loggedIn ?
                        <span>logged in as {auth.username} <button class="button" onClick={this.logout}>logout</button></span>:
                        <span>not logged in <a class="button" href="/login">login</a></span>}
                </div>
            </header>
        )
    }
}