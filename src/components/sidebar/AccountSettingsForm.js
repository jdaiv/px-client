import { h, Component } from 'preact'
import { route } from 'preact-router'

import style from './style'

import Services from '../../services'

export default class AccountSettingsForm extends Component {
    logout = () =>  {
        Services.auth.logout()
        route('/login')
    }

    render() {
        return (
            <div class={style.form}>
                <h2>account settings</h2>
                <p>NONFUNCTIONAL</p>
                <form>
                    <input placeholder="username" />
                    <input placeholder="current password" />
                    <input placeholder="new password" />
                    <input class="button" type="submit" value="update" />
                </form>
                <hr class={style.hr} />
                <button class="button" onClick={this.logout}>logout</button>
            </div>
        )
    }
}