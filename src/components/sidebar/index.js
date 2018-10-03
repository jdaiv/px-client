import { h, Component } from 'preact'
import Router from 'preact-router'
import { Link } from 'preact-router/match'

import AddRoomForm from './AddRoomForm'
import SettingsForm from './SettingsForm'
import AccountSettingsForm from './AccountSettingsForm'
import ChatLog from './chat_log'
import ChatInput from './chat_input'

import style from './style'

import EventManager from '../../services/EventManager'
import Services from '../../services'

const Chat = ({ id }) => (
    <div class={style.chat}>
        <ChatLog target={id} />
        <ChatInput target={id} />
    </div>
)

export default class Sidebar extends Component {
    state = {
        active: false
    }

    toggle = () => {
        this.setState({ active: !this.state.active })
    }

    handleRoute = (r) => {
        let isRoomUrl = r.url.match(/\/room\/(.*)/)
        if (isRoomUrl) {
            const roomId = isRoomUrl[1]
            if (roomId != 'system' && roomId != 'public' && !Services.chat.rooms[roomId]) {
                Services.chat.joinRoom(roomId)
            }
            Services.chat.setActiveRoom(roomId)
        }
    }

    componentDidMount() {
        EventManager.subscribe('chat_update', 'sidebar', ((data) => {
            this.forceUpdate()
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('chat_update', 'sidebar')
    }

    render({ }, { log, active }) {
        const chatTabs = Object.entries(Services.chat.rooms).map((e) => {
            return <Link activeClassName={style.active} href={'/room/' + e[0]}>{e[1].name}</Link>
        })
        return (
            <div class={style.sidebar}>
                <nav class={style.tabs}>
                    {chatTabs}
                    {Object.entries(Services.chat.rooms).length < 3 ? <Link activeClassName={style.active} href="/add_room">add room</Link> : null}
                    <Link activeClassName={style.active} href="/account">account</Link>
                    <Link activeClassName={style.active} href="/settings">settings</Link>
                </nav>
                <hr class={style.hr} />
                <Router onChange={this.handleRoute}>
                    <Chat path="/room/:id" />
                    <AddRoomForm path="/add_room" />
                    <AccountSettingsForm path="/account" />
                    <SettingsForm path="/settings" />
                </Router>
            </div>
        )
    }
}