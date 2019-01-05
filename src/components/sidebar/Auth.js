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
    @observable recovery = false

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

    toggleMode = (evt) => {
        evt.preventDefault()
        this.recovery = !this.recovery
        return false
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
        if (auth.loggedIn) route('/')

        let input = this.recovery ? (
            <input
                style="margin-bottom: 0.25rem"
                name="password"
                type="password"
                placeholder="recovery code"
                minLength="8"
                maxLength="256"
                required="true"
            />
        ) : (
            <input
                style="margin-bottom: 0.25rem"
                name="username"
                autocomplete="off"
                placeholder="username (32 char max)"
                minLength="2"
                maxLength="32"
                required="true"
            />
        )

        return (
            <form class={style.form + ' ' + (auth.processing ? style.disabled : '')} onSubmit={this.login}>
                <h2>welcome!</h2>
                <p>to <strong>the panic express</strong>, we hope you enjoy your stay</p>
                <hr class={style.hr} />
                <h3>{this.recovery ? 'recover user' : 'create user'}</h3>
                {/* <p>New user? Create a new account here!</p> */}
                {input}
                {/* <p class={style.hint}>between 2 to 32 characters</p> */}
                <p class={style.error}>{this.error}</p>
                <input class="button" type="submit" value={this.recovery ? 'recover' : 'go!'} />
                <button class="button" onClick={this.toggleMode}>{this.recovery ? 'new user' : 'recover user'}</button>
            </form>
        )
    }
}