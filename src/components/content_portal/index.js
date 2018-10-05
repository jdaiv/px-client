import { h, Component } from 'preact'
import { inject, observer } from 'mobx-preact'

import ActFireworks from './ActFireworks'

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
        case 1:
            content = <ActFireworks />
            break
        default:
            content = <div class={style.empty}>&nbsp;</div>
        }

        return <div class={style.portal}>{content}</div>
    }

}