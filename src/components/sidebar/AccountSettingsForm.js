import { h } from 'preact'

import style from './style'

const AccountSettingsForm = () => (
    <div class={style.form}>
        <h2>account settings</h2>
        <p>NONFUNCTIONAL</p>
        <form>
            <input placeholder="username" />
            <input placeholder="current password" />
            <input placeholder="new password" />
            <input class="button" type="submit" value="update" />
        </form>
    </div>
)

export default AccountSettingsForm