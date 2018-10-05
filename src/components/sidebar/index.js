import { h, Component } from 'preact'
import Router from 'preact-router'
import { Link } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'

import AddRoomForm from './AddRoomForm'
import SettingsForm from './SettingsForm'
import AccountSettingsForm from './AccountSettingsForm'
import ChatLog from './chat_log'
import ChatInput from './chat_input'
import Auth from './Auth'

import style from './style'

import Services from '../../services'

@inject('rooms')
class Chat extends Component {
    render({ id, rooms }) {
        const room = rooms.get(id)
        return (
            (!room) ? <div /> :
                <div class={style.chat}>
                    <h2>room: {room.name}</h2>
                    <ChatLog log={room.log} />
                    <ChatInput target={id} />
                </div>
        )
    }
}

@inject('auth')
@inject('rooms')
@observer
export default class Sidebar extends Component {
    handleRoute = (r) => {
        let isRoomUrl = r.url.match(/\/room\/(.*)/)
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
            <Link activeClassName={style.active} href={'/room/' + r.id}>{r.name}</Link>
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
                    <Chat path="/room/:id" />
                    <AddRoomForm path="/add_room" />
                    <AccountSettingsForm path="/account" />
                    <Auth path="/login" />
                    <SettingsForm path="/settings" />
                </Router>
            </div>
        )
    }
}