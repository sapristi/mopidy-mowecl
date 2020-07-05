import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect, useSelector, useDispatch } from 'react-redux'

import { createStore,  combineReducers } from 'redux'

// use default font size from semantic ??
// import 'semantic-ui-css/semantic.min.css'
import './index.css'
import 'typeface-roboto';

import {AppContext, getWsAddress} from './utils'

import App from './App'
import * as serviceWorker from './serviceWorker'
import {useWsClient, makeWsClientReducer} from "mopidy-js"

import {mopidyReducer, libraryReducer, playbackReducer, settingsReducer, tracklistReducer} from './reducers'

import {initMopidyEventsDispatcher} from 'mopidy_client'


let MopidyApp = ({mopidy_host, mopidy_port,  colors}) => {
    const dispatch = useDispatch()
    const mopidy = useWsClient(
        "mopidy",
        mopidyCli => initMopidyEventsDispatcher(mopidyCli, dispatch))

    return (
        <AppContext.Provider value={{mopidy: mopidy, dispatch: dispatch}}>
          <App/>
        </AppContext.Provider>
    )
}

MopidyApp = connect(
    state => ({
        mopidy_host: state.settings.persistant.mopidy_host,
        mopidy_port: state.settings.persistant.mopidy_port})
)(MopidyApp)



const store = createStore(
    combineReducers({
        playback_state: playbackReducer,
        tracklist: tracklistReducer,
        library: libraryReducer,
        settings: settingsReducer,
        mopidy: makeWsClientReducer("mopidy")
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
