import { h, Component } from 'preact'
import { route } from 'preact-router'
import { reaction, observable } from 'mobx'
import { inject, observer } from 'mobx-preact'

import style from './style'

import Services from '../../services'

@inject('auth')
@observer
export default class AuthBox extends Component {
    @observable error = null

    login = (evt) => {
        evt.preventDefault()
        const fields = evt.target.elements
        Services.auth.login(fields.username.value, fields.password.value).then(
            ({ error, message }) => {
                if (error != 0) {
                    this.error = message
                } else {
                    this.error = null
                }
            })
    }

    componentDidMount() {
        this.loginReaction = reaction(() => this.props.auth.loggedIn, loggedIn => {
            if (loggedIn === true) route('/room/public')
        })
    }

    componentWillUnmount() {
        this.loginReaction()
    }

    render({ auth }) {
        if (auth.loggedIn) return
        return (
            <form class={style.form + ' ' + (auth.processing ? style.disabled : '')} onSubmit={this.login}>
                <h2>create user/login</h2>
                <input
                    style="margin-bottom: 0.25rem"
                    name="username"
                    autocomplete="off"
                    placeholder="username"
                    minLength="2"
                    maxLength="32"
                    required="true"
                />
                <p class={style.hint}>username must be between 2 and 32 characters</p>
                <input
                    style="margin-bottom: 0.25rem"
                    name="password"
                    type="password"
                    placeholder="password"
                    minLength="8"
                    maxLength="256"
                    required="true"
                />
                <p class={style.hint}>password must be between 8 and 256 characters</p>
                <p class={style.error}>{this.error}</p>
                <input class="button" type="submit" value="login" />
            </form>
        )
    }
}