import { observable } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameManager from '../../../shared/GameManager'
import GameStore from '../../../shared/GameStore'
import Tabs from '../../shared/Tabs'
import Input from './Input'
import Log from './Log'
import style from './style.css'

@observer
class UserList extends Component {
    @observable public users = ['Loading...']

    public componentDidMount() {
        GameManager.instance.getUserList().then((list) => {
            (this.users as any).replace(list)
        })
    }

    public render() {
        return (
            <div class={style.container}>
                {this.users.map((u) => <div key={u}>{u}</div>)}
            </div>
        )
    }
}

@inject('game')
@observer
export default class Chat extends Component<{ game?: GameStore }> {

    @observable public activeTab = 'chat'
    private changeTab = (tab: string) => this.activeTab = tab

    public render({ game }) {
        let inner: any
        switch (this.activeTab) {
            case 'chat':
                inner = (
                    <div class={style.container}>
                        <Log log={game.chatLog.log} />
                        <Input />
                    </div>
                )
                break
            case 'user list':
                inner = <UserList />
                break
        }

        return (
            <div class={style.chat}>
                <Tabs active={this.activeTab} onClick={this.changeTab} options={['chat', 'user list']} />
                {inner}
            </div>
        )
    }
}
