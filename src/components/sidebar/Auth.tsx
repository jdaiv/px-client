import { observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-preact'
import { Component, h } from 'preact'
import Services from '../../services'
import AuthStore from '../../stores/AuthStore'
import Button from '../shared/Button'

import style from './style.css'

@inject('auth')
@observer
export default class AuthBox extends Component<{ auth?: AuthStore }> {
    private loginReaction: any
    @observable private error = null
    @observable private recovery = false

    private login = (evt: Event) => {
        evt.preventDefault()
        const fields = (evt.target as any).elements
        let authMethod: Promise<any>
        if (this.recovery) {
            authMethod = Services.auth.login(fields.password.value)
        } else {
            authMethod = Services.auth.createUser(fields.username.value)
        }
        authMethod.then(
            ({ error, message }) => {
                if (error !== 0) {
                    this.error = message
                } else {
                    this.error = null
                }
            })
    }

    private toggleMode = (evt: Event) => {
        evt.preventDefault()
        this.recovery = !this.recovery
        return false
    }

    public componentDidMount() {
        this.loginReaction = reaction(() => this.props.auth.loggedIn, loggedIn => {
            if (loggedIn === true) route('/room/public')
        })
    }

    public componentWillUnmount() {
        this.loginReaction()
    }

    public render({ auth }) {
        if (auth.loggedIn) route('/')

        const input = this.recovery ? (
            <input
                style="margin-bottom: 0.25rem"
                name="password"
                type="password"
                placeholder="recovery code"
                minLength={8}
                maxLength={256}
                required={true}
            />
        ) : (
            <input
                style="margin-bottom: 0.25rem"
                name="username"
                autocomplete="off"
                placeholder="username (32 char max)"
                minLength={2}
                maxLength={32}
                required={true}
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
                <Button submit={true} large={true} label={this.recovery ? 'recover' : 'go!'} />
                <Button large={true} label={this.recovery ? 'new user' : 'recover user'} onClick={this.toggleMode} />
            </form>
        )
    }
}
