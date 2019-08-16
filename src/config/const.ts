export const apiUrl = process.env.NODE_ENV === 'development' ?
    'http://localhost:8000' :
    'https://multiapi.bigheck.com'
export const wsUrl = process.env.NODE_ENV === 'development' ?
    'ws://localhost:8000/api/ws' :
    'wss://multiapi.bigheck.com/api/ws'
