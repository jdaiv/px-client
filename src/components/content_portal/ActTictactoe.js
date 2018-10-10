import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

// import Canvas from './Canvas'
import style from './style'

import EventManager from '../../services/EventManager'
import Tictactoe from '../../activities/tictactoe'

@inject('rooms')
@inject('auth')
@observer
export default class ActTictactoe extends Component {

    update = () => {
        const auth = this.props.auth
        const room = this.props.rooms.activeRoom
        const currentPlayer = room.activityState.current_player
        const isOwner = room.owner == auth.usernameN
        this.activity.state = {
            board: room.activityState.board,
            winner: room.activityState.winner,
            isOwner,
            isMyTurn: (currentPlayer == 0 && isOwner) || (currentPlayer == 1 && !isOwner),
            loggedIn: auth.loggedIn,
            // : isOwner ? ['', 'winner', 'loser', 'draw'] : ['', 'loser', 'winner', 'draw'],
        }
    }

    componentDidMount() {
        this.activity = new Tictactoe(this.base, this.props.rooms.activeRoom)
        EventManager.subscribe('ws/chat/update_room', 'tictactoe', this.update)
        this.update()
        this.activity.start()
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws/chat/update_room', 'tictactoe')
        this.activity.stop()
    }

    render() {
        return (
            <div class={style.container} />
        )
    }

}