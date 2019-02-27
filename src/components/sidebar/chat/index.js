import { h, Component } from 'preact'
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
    @observable usersOpen = false

    showUsers = () => { this.usersOpen = true }
    closeUsers = () => { this.usersOpen = false }

    render({ ui, auth }) {
        const options = [<button href="/chat" class={(!this.usersOpen ? style.active : '') + ' button'} onClick={this.closeUsers}>chat</button>]
        options.push(<button href="/chat/users" class={(this.usersOpen ? style.active : '') + ' button'} onClick={this.showUsers}>user list</button>)

        let inner = !this.usersOpen ? (
            <div class={style.container}>
                <Log log={ui.log} />
                <Input />
            </div>
        ) : <UserList />
        return (
            <div class={style.chat}>
                {/* <h2>room: {room.name}</h2> */}
                <div class={style.options}>
                    {options.length > 1 ? options : null}
                </div>
                {inner}
            </div>
        )
    }
}