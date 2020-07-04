import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'

import { createStore,  combineReducers } from 'redux'

// use default font size from semantic ??
// import 'semantic-ui-css/semantic.min.css'
import './index.css'
import 'typeface-roboto';
import {AppContext, getWsAddress} from './utils'

import App from './App'
import * as serviceWorker from './serviceWorker'
import MopidyClient from "mopidy-js/mopidy"

import {mopidyReducer, libraryReducer, playbackReducer, settingsReducer, tracklistReducer} from './reducers'

import {initMopidyEventsDispatcher} from 'mopidy_client'

const stopClient = (client) => {
    client.removeAllListeners(); client.close(); client.off()
}

let MopidyApp = ({mopidy_host, mopidy_port,  colors, dispatch}) => {

    const [mopidy, setMopidy] = React.useState(new MopidyClient({autoConnect: false}))

    React.useEffect(() => {
        stopClient(mopidy)
        dispatch({type: "MOPIDY_CLIENT_DISCONNECTED"})
        console.log("Connecting to ", getWsAddress(mopidy_host, mopidy_port, "mopidy"))
        const new_mopidy = new MopidyClient({
            webSocketUrl: getWsAddress(mopidy_host, mopidy_port, "mopidy"),
            autoConnect: false
        })
        try {
            new_mopidy.connect()
        } catch(error) {
            console.log("Error when initializing mopidy", error)
            stopClient(new_mopidy)
            dispatch({type: "MOPIDY_CONNECTION_ERROR", error})
        }

        initMopidyEventsDispatcher(new_mopidy, dispatch)
        dispatch({type: "MOPIDY_CLIENT_CONNECTED", })
        setMopidy(new_mopidy)

    }, [mopidy_host, mopidy_port])

    return (
        <AppContext.Provider value={{mopidy: mopidy, dispatch: dispatch,
                                     colors: colors
                                    }}>
          <App/>
        </AppContext.Provider>
    )
}

MopidyApp = connect(
    state => ({
        mopidy_host: state.settings.persistant.mopidy_host,
        mopidy_port: state.settings.persistant.mopidy_port,
        colors: state.settings.persistant.colors})
)(MopidyApp)



const store = createStore(
    combineReducers({
        playback_state: playbackReducer,
        tracklist: tracklistReducer,
        library: libraryReducer,
        settings: settingsReducer,
        mopidy: mopidyReducer
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

window.$store = store



ReactDOM.render(
    <Provider store={store} style={{height: '100%'}}>
      <MopidyApp />
    </Provider>
    , document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
