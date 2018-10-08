import { h, Component } from 'preact'
import { route } from 'preact-router'
import { observer, inject } from 'mobx-preact'

// import style from './style'
import formStyle from '../style'

import Services from '../../../services'

@inject('rooms')
@observer
export default class Options extends Component {

    submit = (evt) => {
        evt.preventDefault()
        const name = evt.target.elements.name.value
        const activity = evt.target.elements.act.value
        Services.rooms.update(this.props.id, {
            name, activity
        })
        route('/room/' + this.props.id)
    }

    render ({ rooms }) {
        return (
            <div class={formStyle.form}>
                <h2>edit room</h2>
                <p>select an activity and name for your new room</p>
                <form onSubmit={this.submit}>
                    <input name="name" placeholder="room name" value={rooms.activeRoom && rooms.activeRoom.name} autocomplete="off" />
                    <p>select an activity</p>
                    <select name="act">
                        <option value="">nothing</option>
                        {rooms.activityTypes.map(a => <option value={a}>{a}</option>)}
                    </select>
                    <input class="button" type="submit" value="new room" />
                </form>
            </div>
        )
    }

}
