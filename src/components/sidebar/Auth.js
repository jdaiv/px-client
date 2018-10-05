import { h, Component } from 'preact'
import { route } from 'preact-router'
import { reaction } from 'mobx'
import { inject, observer } from 'mobx-preact'

import style from './style'

import Services from '../../services'

@inject('auth')
@observer
export default class AuthBox extends Component {
    login = (evt) => {
        evt.preventDefault()
        const fields = evt.target.elements
        Services.auth.login(fields.username.value, fields.password.value)
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
                <h2>login</h2>
                <input name="username" autocomplete="off" placeholder="username" />
                <input name="password" type="password" placeholder="password" />
                <input class="button" type="submit" value="login" />
            </form>
        )
    }
}