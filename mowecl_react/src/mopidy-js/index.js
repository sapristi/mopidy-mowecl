import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import equal from 'fast-deep-equal'
import { getWsAddress, match} from 'utils'
import MopidyClient from "./mopidy-js.js"


const stopClient = (client) => {
    client.removeAllListeners(); client.close(); client.off()
}

export const useWsClient = (endpoint, init_callback, selector) => {
    const client = useSelector(selector)
    const mopidyHost = useSelector(store => store.settings.persistant.mopidy_host)
    const mopidyPort = useSelector(store => store.settings.persistant.mopidy_port)
    const dispatch = useDispatch()

    React.useEffect(
        () => {
            stopClient(client)
            dispatch({type: 'CLIENT_DISCONNECTED', endpoint})
            console.log("Connecting to ", getWsAddress(mopidyHost, mopidyPort, endpoint))
            const new_client = new MopidyClient({
                webSocketUrl: getWsAddress(mopidyHost, mopidyPort, endpoint),
                autoConnect: false
            })
            try {
                new_client.connect()
            } catch(error) {
                console.log("Error when initializing mopidy client", error)
                stopClient(new_client)
                dispatch({type: 'CONNECTION_ERROR', endpoint, error})
            }
            init_callback(new_client)
            window[endpoint] = new_client
        },
        // eslint-disable-next-line
        [mopidyHost, mopidyPort, endpoint, init_callback])

}

export const makeWsClientReducer = (endpoint) => (
    (
        state={
            connected: false,
            pendingRequestsNb: 0,
            error: null,
            client: new MopidyClient({autoConnect: false})
        },
        action
    ) => match([action.type, action.endpoint], equal, true)
        .on(['UPDATE_CLIENT', endpoint], () =>
            ({...state, client: action.client})
           )
        .on(['CLIENT_CONNECTED', endpoint], () =>
            ({...state, connected: true})
           )
        .on(['CLIENT_DISCONNECTED', endpoint], () =>
            ({...state, connected: false})
           )
        .on(['PENDING_REQUESTS_COUNT', endpoint], () =>
            ({...state, pendingRequestsNb: action.data})
           )
        .on(['CONNECTION_ERROR', endpoint], () =>
            ({...state, error: action.error.toString(), connected: false})
           )
        .otherwise(() => state)
)
