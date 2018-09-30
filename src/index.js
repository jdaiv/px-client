import './style'
import App from './components/app'
import Services from './services'

Services.init()

window.services = Services

export default App
