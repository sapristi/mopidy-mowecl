import { obj_reducer, listEquals } from '../utils'
import Mopidy from "../mopidy-js/mopidy.js"

export const mopidyReducer = (state={
    connected: false,
    connecting: false,
    uri_schemes: [],
    pendingRequestsNb: 0,
    error: null
}, action) => {
    switch (action.type) {
    case 'MOPIDY_CLIENT_CONNECTED':
        return {...state, connected: true, connecting: false}

    case 'MOPIDY_CLIENT_DISCONNECTED':
        return {...state, connected: false, connecting: true}

    case 'MOPIDY_PENDING_REQUESTS_COUNT':
        return {...state, pendingRequestsNb: action.data}

    case 'MOPIDY_CONNECTION_ERROR':
        return {...state, error: action.error.toString(), connected: false}

    case 'URI_SCHEMES':
        return {...state, uri_schemes: action.data}

    default:
        return state

    }
}


