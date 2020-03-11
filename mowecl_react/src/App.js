import React from 'react'
import { connect } from 'react-redux'


import './App.css'
import Footer from './components/footer'

import SidePanel from './components/sidePanel'
import TracklistPanel from './components/tracklist'
import LibraryPanel from './components/library'
import SettingsPanel from './components/settingsPanel'
import HelpPanel from './components/helpPanel'

import CircularProgress from '@material-ui/core/CircularProgress';


let AppContainer = ({children}) => (

    <div className="App"
         style={{display: 'flex', flexDirection: 'column',
                 height:'100%', overflow: 'hidden'}}>
      <div style={{display: 'flex', flexDirection: 'row',  minHeight: '0', flex: 1}}>
        <SidePanel/>
        {children}
      </div>
      <Footer style={{display: 'flex', flex: 1, }}/>
    </div>

)

let App = ({settings, mopidy, dispatch}) => {

    // console.log("Main: ", settings)
    let activePanel = null
    switch (settings.active_panel) {
    case 'control':
        activePanel = <SettingsPanel/>
        break
    case 'help':
        activePanel = <HelpPanel/>
        break
    default:
        activePanel = <LibraryPanel/>
    }

    if (mopidy.connected) {
        return (
            <AppContainer>
              <div style={{height: '100%', width: '100%', flexDirection: 'row', display: 'flex'}}>
                <div style={{ width: '50%', height: '100%', overflow: 'auto'}}>
                  {activePanel}
                </div>
                <div style={{height: '100%', width: '50%'}}>
                  <TracklistPanel/>
                </div>
              </div>
            </AppContainer>
        ) } else {
            return (
                <AppContainer>
                  <div style={{ width: '50%', height: '100%', overflow: 'auto'}}>
                    <SettingsPanel/>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{flex: 1}}/>
                    <div style={{flex: 1}}><CircularProgress color="inherit"
                                                             style={{margin: 'auto'}}
                                           /></div>
                    <div style={{flex: 1}}>
                      <div>Trying to reach mopidy at {settings.persistant.mopidy_ws.current}</div>
                      <div>{mopidy.error}</div>
                    </div>
                    <div style={{flex: 1}}/>
                  </div>
                </AppContainer>
            )
        }
}

export default connect(state => {return {settings: state.settings, mopidy: state.mopidy}})(App)
