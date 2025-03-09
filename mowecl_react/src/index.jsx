import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Provider, useSelector } from 'react-redux'

import { createStore,  combineReducers } from 'redux'

// use default font size from semantic ??
// import 'semantic-ui-css/semantic.min.css'
import './index.css'
import 'typeface-roboto';

import {App, AppSmall} from './App'
import * as serviceWorker from './serviceWorker'
import {useWsClient, makeWsClientReducer} from "./mopidy-js"

import {libraryReducer, playbackReducer, settingsReducer, tracklistReducer} from './reducers'
import {initMopidyEventsDispatcher} from './client_setup/mopidy'
import {initBookmarksEventsDispatcher, bookmarksStateReducer} from './client_setup/bookmarks'
import { useAppState } from './hooks';

const MopidyApp = () => {
    const mopidy_connected = useSelector(state => state.mopidy.connected)
    const mopidy_error = useSelector(state => state.mopidy.error)
    const activePanelName = useAppState(state => state.activePanelName)
    console.log(activePanelName)

    const appProps = {
        mopidy_connected,
        mopidy_error,
        activePanelName,
    }
    const small_screen = useSelector(state => state.settings.persistant.generic.small_screen)
    useWsClient(
        "mopidy",
        initMopidyEventsDispatcher
    )

    useWsClient(
        "bookmarks",
        initBookmarksEventsDispatcher
    )
    if (small_screen) {
        return <AppSmall {...appProps}/>
    } else {
        return <App {...appProps}/>
    }
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

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);
root.render(
    <StrictMode>
      <Provider store={store} style={{height: '100%'}}>
        <MopidyApp />
      </Provider>
    </StrictMode>
);

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
