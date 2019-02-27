import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { Link } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import SettingsForm from './SettingsForm'
import AccountSettingsForm from './AccountSettingsForm'
import Player from './player'
import Chat from './chat'
import Auth from './Auth'

import style from './style'

class Redirect extends Component {
    componentWillMount() {
        route(this.props.to, true)
    }

    render() {
        return null
    }
}

@inject('auth')
@observer
export default class Sidebar extends Component {
    @observable active = true

    close = () => { this.active = false }

    render({ auth }) {

        if (auth.loggedIn) {
            return (
                <div class={style.sidebar}>
                    <div class={style.inner}>
                        <nav class={style.tabs}>
                            <Link activeClassName={style.active} href="/player">player</Link>
                            <Link activeClassName={style.active} href="/account">account</Link>
                            <Link activeClassName={style.active} href="/settings">settings</Link>
                        </nav>
                        <hr class={style.hr} />
                        <div class={style.content} /* style={{ display: this.active ? 'block' : 'none' }} */>
                            <Router>
                                <Redirect default to="/player" />
                                <Player path="/player" />
                                <AccountSettingsForm path="/account" />
                                <SettingsForm path="/settings" />
                            </Router>
                        </div>
                        <hr class={style.hr} />
                        <Chat />
                    </div>
                </div>
            )
        }

        return (
            <div class={style.sidebar}>
                <div class={style.inner}>
                    <div class={style.content}>
                        <Auth />
                    </div>
                </div>
            </div>
        )

    }
}