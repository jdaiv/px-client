import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import ActFireworks from './ActFireworks'
import ActTictactoe from './ActTictactoe'
// import BootlegHearthstone from '../../activities/bootleg_hearthstone'

import style from './style'

@inject('rooms')
@observer
export default class ContentPortal extends Component {

    render({ rooms }) {
        let activity = -1
        const activeRoom = rooms.activeRoom
        if (activeRoom) {
            activity = activeRoom.activity
        }

        let content
        switch (activity) {
        case 'fireworks':
            content = <ActFireworks />
            break
        case 'tictactoe':
            content = <ActTictactoe />
            break
        default:
            // content = <BootlegHearthstone />
            content = <div class={style.empty}>&nbsp;</div>
        }

        return <div class={style.portal}>{content}</div>
    }

}