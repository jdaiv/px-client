import { h, Component } from 'preact'
import style from './style'
import Connector from '../../services/Connector'
import EventManager from '../../services/EventManager'

export default class Debug extends Component {
    state = {
        log: '',
        active: false
    }

    toggle = () => {
        this.setState({ active: !this.state.active })
    }

    componentDidMount() {
        EventManager.subscribe('ws_debug', 'debug_log', ((data) => {
            if (data) this.setState({
                log: this.state.log += `${(new Date()).toLocaleTimeString()} ${JSON.stringify(data)}\n`
            })
            else this.setState({})
        }).bind(this))
    }

    componentWillUnmount() {
        EventManager.unsubscribe('ws_debug', 'debug_log')
    }

    render({ }, { log, active }) {
        return (
            <div class={style.debug + (active ? ' ' + style.active : '')}>
                <button class={'button ' + style.toggle} onClick={this.toggle}>
                    Toggle Debug Panel
                </button>
                <div class={style.box}>
                    <strong>State:</strong>{Connector.ws ? Connector.ws.readyState : 0}<br />
                    <strong>Retries:</strong>{Connector.retries}<br />
                    <strong>Ready:</strong>{Connector.ready ? 'Yes' : 'No'}<br />
                    <strong>Authenticated:</strong>{Connector.authenticated ? 'Yes' : 'No'}
                </div>
                <div class={style.box}>
                    <pre>{log}</pre>
                </div>
            </div>
        )
    }
}