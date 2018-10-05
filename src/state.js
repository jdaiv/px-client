const DEFAULT_STATE = {
    chat: {
        connected: false,
        activeRoom: 'public',
        rooms: [],
    },
    connector: {
        ready: false,
        authenticated: false,
    },
    auth: {
        loggedIn: false,
        username: '',
    }
}

let state

if (window.appState) {
    state = window.appState
} else {
    state = DEFAULT_STATE
    window.appState = state
}

export default state