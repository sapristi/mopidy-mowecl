import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect, useSelector, useDispatch } from 'react-redux'
import {
    RecoilRoot,
} from 'recoil';

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

import {initMopidyEventsDispatcher} from 'client_setup/mopidy'

import {initBookmarksEventsDispatcher, bookmarksStateReducer} from 'client_setup/bookmarks'

const MopidyApp = ({mopidy_host, mopidy_port,  colors}) => {
    const dispatch = useDispatch()

    useWsClient(
        "mopidy",
        mopidyCli => initMopidyEventsDispatcher(mopidyCli, dispatch),
        store => store.mopidy.client
    )

    useWsClient(
        "bookmarks",
        bookmarksCli => initBookmarksEventsDispatcher(bookmarksCli, dispatch),
        store => store.bookmarks.client
    )
    return (
          <App/>
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
