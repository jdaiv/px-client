import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import Input from './Input'
import Log from './Log'
import style from './style.css'

@inject('game')
@observer
export default class Chat extends Component<{ game?: GameStore }> {

    public render({ game }) {
        return (
            <div class={style.chat}>
                <div class={style.container}>
                    <Log log={game.chatLog.log} />
                    <Input />
                </div>
            </div>
        )
    }
}
