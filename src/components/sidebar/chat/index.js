import { h, Component } from 'preact'
import { Router } from 'preact-router'
import { Link } from 'preact-router/match'
import { inject, observer } from 'mobx-preact'
import { observable } from 'mobx'

import style from './style'

import Log from './Log'
import Input from './Input'

import Services from '../../../services'

@observer
class UserList extends Component {
    @observable users = ['Loading...']

    componentDidMount() {
        Services.getUserList(this.props.id).then((list) => {
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

@inject('ui')
@inject('auth')
@observer
export default class Chat extends Component {
    render({ ui, auth }) {
        const options = [<Link activeClassName={style.active} href="/chat" class="button">chat</Link>]
        options.push(<Link activeClassName={style.active} href="/chat/users" class="button">user list</Link>)
        return (
            <div class={style.chat}>
                {/* <h2>room: {room.name}</h2> */}
                <div class={style.options}>
                    {options.length > 1 ? options : null}
                </div>
                <Router>
                    <div path="/chat" class={style.container}>
                        <Log log={ui.log} />
                        <Input />
                    </div>
                    <UserList path="/chat/users" />
                </Router>
            </div>
        )
    }
}