import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import style from './style'

import EventManager from '../../services/EventManager'
import Services from '../../services'
import Fireworks from '../../activities/fireworks'

@inject('rooms')
@inject('auth')
@observer
export default class ActFireworks extends Component {

    launch = () => {
        Services.socket.send('activity', 'launch', this.props.rooms.active)
    }

    componentDidMount() {
        this.activity = new Fireworks(this.base)
        EventManager.subscribe('ws/activity/launch', 'fireworks', (({ action, data }) => {
            if (action.target == this.props.rooms.active) {
                this.activity.launch(data)
            }
        }).bind(this))
        this.activity.start()
    }

    shouldComponentUpdate() {
        return false
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws/activity/launch', 'fireworks')
        this.activity.stop()
    }

    render({ auth }) {
        return (
            <div class={style.container}>
                <button onClick={this.launch} class={'button ' + style.launch} style={{ display: auth.loggedIn ? 'block' : 'none' }}>launch!</button>
            </div>
        )
    }

}