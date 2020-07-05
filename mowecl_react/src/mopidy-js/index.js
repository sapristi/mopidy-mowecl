import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { getWsAddress} from 'utils'
import MopidyClient from "./mopidy-js.js"


const stopClient = (client) => {
    client.removeAllListeners(); client.close(); client.off()
}

export const useWsClient = (endpoint, init_callback) => {
    const [client, setClient] = React.useState(new MopidyClient({autoConnect: false}))
    const mopidyHost = useSelector(store => store.settings.persistant.mopidy_host)
    const mopidyPort = useSelector(store => store.settings.persistant.mopidy_port)
    const dispatch = useDispatch()

    const action_prefix = endpoint.toUpperCase()
    React.useEffect(() => {
        stopClient(client)
        dispatch({type: `${action_prefix}_CLIENT_DISCONNECTED`})
        console.log("Connecting to ", getWsAddress(mopidyHost, mopidyPort, endpoint))
        const new_client = new MopidyClient({
            webSocketUrl: getWsAddress(mopidyHost, mopidyPort, endpoint),
            autoConnect: false
        })
        try {
            new_client.connect()
        } catch(error) {
            console.log("Error when initializing mopidy", error)
            stopClient(new_client)
            dispatch({type: `${action_prefix}_CONNECTION_ERROR`, error})
        }

        init_callback(new_client)
        dispatch({type: `${action_prefix}_CLIENT_CONNECTED`, })
        setClient(new_client)

    }, [mopidyHost, mopidyPort])

    return client
}
