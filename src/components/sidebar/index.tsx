import { observable } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import GameStore from '../../shared/GameStore'
import Tabs from '../shared/Tabs'
import AccountSettingsForm from './AccountSettingsForm'
import Auth from './Auth'
import Chat from './chat'
import Editor from './editor'
import Player from './player'
import SettingsForm from './SettingsForm'
import style from './style.css'

@inject('game')
@observer
export default class Sidebar extends Component<{ game?: GameStore }> {

    @observable public activeTab = 'editor'
    private changeTab = (tab: string) => this.activeTab = tab

    public render({ game }) {

        let inner: any
        switch (this.activeTab) {
            case 'player':
                inner = <Player />
                break
            case 'account':
                inner = <AccountSettingsForm />
                break
            case 'settings':
                inner = <SettingsForm />
                break
            case 'editor':
                inner = <Editor />
                break
        }

        if (game.connection.validUser) {
            return (
                <div class={style.sidebar}>
                    <div class={style.inner}>
                        <Tabs
                            active={this.activeTab}
                            onClick={this.changeTab}
                            options={['player', 'account', 'settings', 'editor']}
                        />
                        <div class={style.content}>{inner}</div>
                        <hr class={style.hr} />
                        <Chat />
                    </div>
                </div>
            )
        }

        return (
            <div class={style.sidebar}>
                <div class={style.inner}>
                    <div class={style.content}>
                        <Auth />
                    </div>
                </div>
            </div>
        )

    }

}
