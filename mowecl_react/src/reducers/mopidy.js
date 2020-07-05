import { obj_reducer, listEquals, match } from '../utils'

export const mopidyReducer = (
    state={
        connected: false,
        pendingRequestsNb: 0,
        error: null
    },
    action
) => match(action.type)
    .on('MOPIDY_CLIENT_CONNECTED', () =>
        ({...state, connected: true})
       )
    .on('MOPIDY_CLIENT_DISCONNECTED', () =>
        ({...state, connected: false})
       )
    .on('MOPIDY_PENDING_REQUESTS_COUNT', () =>
        ({...state, pendingRequestsNb: action.data})
       )
    .on('MOPIDY_CONNECTION_ERROR', () =>
        ({...state, error: action.error.toString(), connected: false})
       )
    .otherwise(() => state)


