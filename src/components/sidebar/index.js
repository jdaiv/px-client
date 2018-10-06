import { h, Component } from 'preact'
import { Router, route, Link as StaticLink } from 'preact-router'
import { Link, Match } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'

import AddRoomForm from './AddRoomForm'
import SettingsForm from './SettingsForm'
import AccountSettingsForm from './AccountSettingsForm'
import Chat from './chat'
import Auth from './Auth'

import style from './style'

import Services from '../../services'

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
    handleRoute = (r) => {
        let isRoomUrl = r.url.match(/\/room\/([^/]*)\/?/)
        if (isRoomUrl) {
            const roomId = isRoomUrl[1]
            if (roomId != 'system' && roomId != 'public' && !this.props.rooms.get(roomId)) {
                Services.rooms.join(roomId).then(() => this.props.rooms.setActive(roomId))
            } else {
                this.props.rooms.setActive(roomId)
            }

        }
    }

    render({ auth, rooms }) {
        let options = rooms.list.map(r => (
            <Match>
                {({ matches, path, url }) => {
                    const key = '/room/' + r.id
                    return <StaticLink class={url.startsWith(key) ? style.active : ''} href={key}>{r.name}</StaticLink>
                }}
            </Match>
        ))
        if (rooms.list.length < 3) {
            options.push(<Link activeClassName={style.active} href="/add_room">{auth.loggedIn ? 'add/join' : 'join'} room</Link>)
        }
        if (auth.loggedIn) {
            options.push(<Link activeClassName={style.active} href="/account">account</Link>)
        } else {
            options.push(<Link activeClassName={style.active} href="/login">login</Link>)
        }
        return (
            <div class={style.sidebar}>
                <nav class={style.tabs}>
                    {options}
                    <Link activeClassName={style.active} href="/settings">settings</Link>
                </nav>
                <hr class={style.hr} />
                <Router onChange={this.handleRoute}>
                    <Redirect default to="/room/public" />
                    <Chat path="/room/:id/:option?" />
                    <AddRoomForm path="/add_room" />
                    <AccountSettingsForm path="/account" />
                    <Auth path="/login" />
                    <SettingsForm path="/settings" />
                </Router>
            </div>
        )
    }
}