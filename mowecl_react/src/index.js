import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'

import { createStore,  combineReducers } from 'redux'

// use default font size from semantic ??
// import 'semantic-ui-css/semantic.min.css'
import './index.css'
import 'typeface-roboto';
import {AppContext} from './utils'

import App from './App'
import * as serviceWorker from './serviceWorker'

import {mopidyReducer, libraryReducer, playbackReducer, settingsReducer, tracklistReducer} from './reducers'


let MopidyApp = ({mopidy, settings, dispatch}) => {
    if (!mopidy.connected && !mopidy.connecting && !mopidy.error) {
        dispatch({type: 'CONNECT', mopidy_ws: settings.persistant.mopidy_ws.current, dispatch})
    }

    return (
        <AppContext.Provider value={{mopidy: mopidy.mopidy, dispatch: dispatch}}>
          <App/>
        </AppContext.Provider>
    )
}

MopidyApp = connect(state => {return {mopidy: state.mopidy, settings: state.settings}})(MopidyApp)



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
