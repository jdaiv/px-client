import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { Link } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import style from './style'

import Log from './Log'
import Input from './Input'
import Options from './Options'

import Services from '../../../services'

@observer
class UserList extends Component {
    @observable users = ['Loading...']

    componentDidMount() {
        Services.rooms.getUserList(this.props.id).then((list) => {
            this.users.replace(list)
        })
    }

    render() {
        return (
            <div class={style.container}>
                {this.users.map(u => <div>{u}</div>)}
            </div>
        )
    }
}

@inject('rooms')
@inject('auth')
@observer
export default class Chat extends Component {
    render({ id, rooms, auth }) {
        const room = rooms.get(id)
        if (!room) {
            route('/rooms/public')
            return
        }
        const options = [<Link activeClassName={style.active} href={'/room/' + id} class="button">chat</Link>]
        if (id != 'public' && id != 'system' && auth.loggedIn && room.owner == auth.usernameN) {
            options.push(<Link activeClassName={style.active} href={'/room/' + id + '/options'} class="button">options</Link>)
        }
        if (id != 'system') {
            options.push(<Link activeClassName={style.active} href={'/room/' + id + '/users'} class="button">user list</Link>)
        }
        if (id != 'public' && id != 'system') {
            // options.push(<button class="button">leave</button>)
        }
        return (
            (!room) ? <div /> : (
                <div class={style.chat}>
                    <h2>room: {room.name}</h2>
                    <div class={style.options}>
                        {options.length > 1 ? options : null}
                    </div>
                    <Router>
                        <div path="/room/:id" class={style.container}>
                            <Log log={room.log} />
                            <Input target={id} />
                        </div>
                        <UserList path="/room/:id/users" />
                        <Options path="/room/:id/options" />
                    </Router>
                </div>
            )
        )
    }
}