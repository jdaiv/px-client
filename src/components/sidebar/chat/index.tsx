import { observable, ObservableSet } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../../../services'
import Tabs from '../../shared/Tabs'
import Input from './Input'
import Log from './Log'
import style from './style.css'

@observer
class UserList extends Component {
    @observable public users = ['Loading...']

    public componentDidMount() {
        Services.getUserList().then((list) => {
            (this.users as any).replace(list)
        })
    }

    public render() {
        return (
            <div class={style.container}>
                {this.users.map((u) => <div>{u}</div>)}
            </div>
        )
    }
}

@inject('ui')
@inject('auth')
@observer
export default class Chat extends Component<{ ui?: any; auth?: any }> {

    @observable public activeTab = 'chat'
    private changeTab = (tab: string) => this.activeTab = tab

    public render({ ui, auth }) {
        let inner: any
        switch (this.activeTab) {
            case 'chat':
                inner = <div class={style.container}>
                    <Log log={ui.log} />
                    <Input />
                </div>
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
