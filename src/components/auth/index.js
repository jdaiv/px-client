import { h, Component } from 'preact'
import style from './style'
import EventManager from '../../services/EventManager'
import Auth from '../../services/Auth'

export default class AuthBox extends Component {
    state = {
        username: Auth.username,
        loggedIn: !!Auth.token,
        processing: false,
    }

    login = (evt) => {
        evt.preventDefault()
        this.setState({ processing: false })
        const fields = evt.target.elements
        Auth.login(fields.username.value, fields.password.value)
    }

    logout = () => {
        Auth.logout()
    }

    componentDidMount() {
        EventManager.subscribe('auth_update', 'authbox', ((data) => {
            this.setState({
                username: Auth.username,
                loggedIn: data,
                processing: false,
            })
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('auth_update', 'authbox')
    }

    render({ }, { username, loggedIn, processing }) {
        let inner
        if (!loggedIn) {
            inner = (<form onsubmit={this.login}>
                <label>Username</label> <input name="username" autocomplete="off" />
                &nbsp;<label>Password</label> <input name="password" type="password" />
                &nbsp;<input class="button" type="submit" value="Login" />
            </form>)
        } else {
            inner = (
                <div>
                    Hello {username}!
                    &nbsp;<button class="button" onClick={this.logout}>Logout</button>
                </div>)
        }
        return (
            <div class={style.auth_container}>
                {inner}
            </div>
        )
    }
}