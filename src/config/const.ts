export const apiUrl = process.env.NODE_ENV === 'development' ?
    'http://localhost:8000' :
    'https://engine.panic.express'
export const wsUrl = process.env.NODE_ENV === 'development' ?
    'ws://localhost:8000/api/ws' :
    'wss://engine.panic.express/api/ws'
