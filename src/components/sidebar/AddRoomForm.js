import { h, Component } from 'preact'
import { route } from 'preact-router'
import { inject, observer } from 'mobx-preact'

import style from './style'

import Services from '../../services'

@inject('auth')
@observer
export default class AddRoom extends Component {

    submitCreate = (evt) => {
        evt.preventDefault()
        const name = evt.target.elements.name.value
        if (name.length > 0) {
            Services.rooms.create(name).then((id) => route('/room/' + id))
            evt.target.reset()
        }
    }

    submitJoin = (evt) => {
        evt.preventDefault()
        const id = evt.target.elements.id.value
        if (id.length > 0) {
            Services.rooms.join(id).then(() => route('/room/' + id))
            evt.target.reset()
        }
    }

    render({ auth }) {
        return (
            <div class={style.form}>
                {auth.loggedIn ? (<div>
                    <h2>create a new room</h2>
                    <p>select an activity and name for your new room</p>
                    <form onSubmit={this.submitCreate}>
                        <input name="name" placeholder="room name" autocomplete="off" />
                        <input class="button" type="submit" value="create" />
                    </form>
                    <hr class={style.hr} />
                </div>) : ''}
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