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
                    <input class="button" type="submit" value="update" />
                </form>
                <hr class={style.hr} />
                <h2>recovery code</h2>
                <p style="overflow-wrap: break-word;">{ Services.auth.password }</p>
                <hr class={style.hr} />
                <button class="button" onClick={this.logout}>logout</button>
            </div>
        )
    }
}