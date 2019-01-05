import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { Link } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import SettingsForm from './SettingsForm'
import AccountSettingsForm from './AccountSettingsForm'
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
@inject('rooms')
@observer
export default class Sidebar extends Component {
    @observable active = true

    close = () => { this.active = false }

    render({ auth, rooms }) {
        let options = []
        options.push(<Link activeClassName={style.active} href="/">chat</Link>)
        options.push(<Link activeClassName={style.active} href="/add_room">{auth.loggedIn ? 'add' : 'join'} room</Link>)
        if (auth.loggedIn) {
            options.push(<Link activeClassName={style.active} href="/account">account</Link>)
        } else {
            options.push(<Link activeClassName={style.active} href="/login">login</Link>)
        }

        let tabs
        if (auth.loggedIn) {
            tabs = (
                <nav class={style.tabs}>
                    {options}
                    <Link activeClassName={style.active} href="/settings">settings</Link>
                </nav>
            )
        }

        return (
            <div class={style.sidebar}>
                <div class={style.inner}>
                    {tabs}
                    {auth.loggedIn ? <hr class={style.hr} /> : null}
                    <div class={style.content} /* style={{ display: this.active ? 'block' : 'none' }} */>
                        <Router>
                            <Redirect default to="/" />
                            <Chat path="/" />
                            <AccountSettingsForm path="/account" />
                            <Auth path="/login" />
                            <SettingsForm path="/settings" />
                        </Router>
                    </div>
                </div>
            </div>
        )
    }
}