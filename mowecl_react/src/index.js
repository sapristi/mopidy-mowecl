import React from 'react'
import ReactDOM from 'react-dom'
import {Provider, useSelector } from 'react-redux'
import {
    RecoilRoot,
} from 'recoil';

import { createStore,  combineReducers } from 'redux'

// use default font size from semantic ??
// import 'semantic-ui-css/semantic.min.css'
import './index.css'
import 'typeface-roboto';

import {App, AppSmall} from './App'
import * as serviceWorker from './serviceWorker'
import {useWsClient, makeWsClientReducer} from "mopidy-js"

import {libraryReducer, playbackReducer, settingsReducer, tracklistReducer} from './reducers'
import {initMopidyEventsDispatcher} from 'client_setup/mopidy'
import {initBookmarksEventsDispatcher, bookmarksStateReducer} from 'client_setup/bookmarks'

const MopidyApp = () => {
    const appProps = useSelector(
        state =>
            ({
                active_panel_name: state.settings.active_panel,
                colors: state.settings.persistant.colors,
                mopidy_connected: state.mopidy.connected,
                mopidy_error: state.mopidy_error
            })
    )
    const small_screen = useSelector(state => state.settings.persistant.generic.small_screen)
    useWsClient(
        "mopidy",
        initMopidyEventsDispatcher
    )

    useWsClient(
        "bookmarks",
        initBookmarksEventsDispatcher
    )
    return (
        (small_screen)
            ? (<AppSmall {...appProps}/>)
            : (<App {...appProps}/>)
    )
}


const store = createStore(
    combineReducers({
        playback_state: playbackReducer,
        tracklist: tracklistReducer,
        library: libraryReducer,
        settings: settingsReducer,
        mopidy: makeWsClientReducer("mopidy"),
        bookmarks: makeWsClientReducer("bookmarks"),
        bookmarksState: bookmarksStateReducer,
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

window.$store = store

ReactDOM.render(
    <Provider store={store} style={{height: '100%'}}>
      <RecoilRoot>
        <MopidyApp />
      </RecoilRoot>
    </Provider>
    , document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

// Trigger buttons blur so that spacebar doesn't affect them
document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
        this.blur();
    })
})
