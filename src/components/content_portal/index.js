import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import EventManager from '../../services/EventManager'
import Engine from '../../engine/Engine'
// import ActFireworks from './ActFireworks'
// import ActTictactoe from './ActTictactoe'
// import BootlegHearthstone from '../../activities/bootleg_hearthstone'

import style from './style'

@inject('rooms')
@observer
export default class ContentPortal extends Component {

    componentDidMount() {
        this.engine = new Engine(this.base)
    }

    componentWillUnmount() {
        this.engine.destroy()
    }

    render({ rooms }) {
        // let activity = -1
        // const activeRoom = rooms.activeRoom
        // if (activeRoom) {
        //     activity = activeRoom.activity
        // }

        // let content
        // switch (activity) {
        // case 'fireworks':
        //     content = <ActFireworks />
        //     break
        // case 'tictactoe':
        //     content = <ActTictactoe />
        //     break
        // default:
        //     // content = <BootlegHearthstone />
        //     content = <div class={style.empty}>&nbsp;</div>
        // }
        // return <div class={style.portal}>{content}</div>

        return (
            <div class={style.portal}>
                <Overlay engine={this.engine} />
            </div>
        )
    }

}

class Overlay extends Component {

    state = {
        players: []
    }

    componentDidMount() {
        EventManager.subscribe('ws/chat/update_room', 'overlay', ({ action, data }) => {
            let players = []
            for (let key in data.state.players) {
                players.push({
                    key,
                    data: data.state.players[key]
                })
            }
            this.setState({
                players
            })
        })
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws/chat/update_room', 'overlay')
    }

    render() {
        if (!this.base) return <div />
        const rect = this.base.getBoundingClientRect()
        const cX = rect.width / 2
        const cY = rect.height / 2
        let bits = this.state.players.map(p => {
            const left = cX + p.data.x * 2 + p.data.z * 2 - 50
            const top = cY + p.data.y * -2 + p.data.z * 2
            return <div class={style.bit} style={{ left, top }}>{p.key}</div>
        })
        return (
            <div class={style.overlay}>
                {bits}
            </div>
        )
    }

}