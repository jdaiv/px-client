import { h, Component } from 'preact'
import { route } from 'preact-router'

import style from './style'

import EventManager from '../../services/EventManager'
import Services from '../../services'

export default class AddRoom extends Component {

    submitCreate = (evt) => {
        evt.preventDefault()
        const name = evt.target.elements.name.value
        const act = parseInt(evt.target.elements.act.value, 10)
        if (name.length > 0) {
            Services.chat.createRoom(name, act)
            evt.target.reset()
        }
    }

    submitJoin = (evt) => {
        evt.preventDefault()
        const id = evt.target.elements.id.value
        if (id.length > 0) {
            Services.chat.joinRoom(id)
            evt.target.reset()
        }
    }

    componentDidMount() {
        EventManager.subscribe('chat_join', 'room_form', ((data) => {
            console.log(data)
            route('/room/' + data)
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('chat_join', 'room_form')
    }

    render() {
        return (
            <div class={style.form}>
                <h2>create a new room</h2>
                <p>select an activity and name for your new room</p>
                <form onSubmit={this.submitCreate}>
                    <input name="name" placeholder="room name" autocomplete="off" />
                    <select name="act">
                        <option value="-1">Select Activity</option>
                        <option value="0">Nothing</option>
                        <option value="1">Fireworks</option>
                    </select>
                    <input class="button" type="submit" value="new room" />
                </form>
                <hr class={style.hr} />
                <h2>join an existing room</h2>
                <p>enter a room code to join a room</p>
                <form onSubmit={this.submitJoin}>
                    <input name="id" placeholder="00000000-0000-0000-0000-000000000000" autocomplete="off" />
                    <input class="button" type="submit" value="join" />
                </form>
            </div>
        )
    }

}