import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

// import Canvas from './Canvas'
import style from './style'

import EventManager from '../../services/EventManager'
import Services from '../../services'

@inject('rooms')
@inject('auth')
class Btn extends Component {

    click = () => {
        Services.socket.send('activity', 'move',
            this.props.rooms.active, { x: this.props.x, y: this.props.y })
    }

    render({ num }) {
        return <button class="button" onClick={this.click}>{['[ ]', '[X]', '[O]'][num]}</button>
    }

}

@inject('rooms')
@inject('auth')
@observer
export default class ActTictactoe extends Component {

    componentDidMount() {
        EventManager.subscribe('ws/activity/move', 'tictactoe', (({ action, data }) => {

        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws/activity/move', 'tictactoe')
    }

    render({ rooms, auth }) {
        const b = rooms.activeRoom.activityState.board
        const currentPlayer = rooms.activeRoom.activityState.current_player
        const winner = rooms.activeRoom.activityState.winner
        const isOwner = rooms.activeRoom.owner == auth.usernameN
        const isMyTurn = (currentPlayer == 0 && isOwner) || (currentPlayer == 1 && !isOwner)
        const _winner = isOwner ? ['', 'winner', 'loser', 'draw'] : ['', 'loser', 'winner', 'draw']
        return (
            <div class={style.container}>
                <Btn x={0} y={0} num={b[0]} />
                <Btn x={1} y={0} num={b[1]} />
                <Btn x={2} y={0} num={b[2]} /><br />
                <Btn x={0} y={1} num={b[3]} />
                <Btn x={1} y={1} num={b[4]} />
                <Btn x={2} y={1} num={b[5]} /><br />
                <Btn x={0} y={2} num={b[6]} />
                <Btn x={1} y={2} num={b[7]} />
                <Btn x={2} y={2} num={b[8]} /><br />
                <div>{winner == 0 ? (isMyTurn ? 'my turn' : '') : ''}</div>
                <div>{winner > 0 ? _winner[winner] : ''}</div>
            </div>
        )
    }

}