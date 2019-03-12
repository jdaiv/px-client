import { Component, h } from 'preact'
import Button from '../shared/Button'
import style from './style.css'

export default class AccountSettingsForm extends Component {
    private logout = () =>  {
        // Services.auth.logout()
    }

    public render() {
        return (
            <div class={style.form}>
                <h2>account settings</h2>
                <p>NONFUNCTIONAL</p>
                <form>
                    <input placeholder="username" />
                    <Button large={true} label="update" />
                </form>
                <hr class={style.hr} />
                <h2>recovery code</h2>
                {/* <p style="overflow-wrap: break-word;">{Services.auth.password}</p> */}
                <hr class={style.hr} />
                <Button large={true} label="logout" onClick={this.logout} />
            </div>
        )
    }
}
