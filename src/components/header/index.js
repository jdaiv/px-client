import { h } from 'preact'
import style from './style'
import AuthBox from '../auth'

const Header = () => (
    <header class={style.header}>
        <h1>Testing</h1>
        <div class={style.auth}>
            <AuthBox />
        </div>
    </header>
)

export default Header
