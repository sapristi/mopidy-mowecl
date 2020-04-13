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
import Paper from '@material-ui/core/Paper';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

let AppContainer = ({colors, children}) => {
    const THEME = createMuiTheme({
        palette: {
            type: "dark",
            background: {
                paper: colors.background.current,
                default: colors.background.current,
            },
            primary: {
                main: colors.primary.current
            },
            // secondary: {
            //     main: colors.secondary.current
            // },
            text: {
                primary: colors.text.current,
                secondary: colors.text.current,
            }
        },
        overrides: {
            MuiLinearProgress: {
                colorPrimary: {
                    backgroundColor: colors.background.current
                },
                bar1Indeterminate: {
                    animation: "MuiLinearProgress-keyframes-indeterminate1 6.3s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite"
                },
                bar2Indeterminate: {
                    animation: "MuiLinearProgress-keyframes-indeterminate2 6.3s cubic-bezier(0.165, 0.84, 0.44, 1) 4.45s infinite"
                }

            }
        }
    })

    return (
    <MuiThemeProvider theme={THEME}>
      <div className="App"
             style={{display: 'flex', flexDirection: 'column',
                     height:'100%', overflow: 'hidden',
                     backgroundColor: colors.background.current,
                     scrollbarColor: `${colors.text.current} ${colors.background.current}`,
                     scrollbarWidth: 'thin',
                     textAlign: 'center'
                    }}>
        <div style={{display: 'flex', flexDirection: 'row',  minHeight: '0', flex: 1}}>
          <SidePanel/>
          {children}
        </div>
        <Footer style={{display: 'flex', flex: 1, }}/>
      </div>
    </MuiThemeProvider>
    )
}

let App = ({settings, mopidy, dispatch}) => {
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

    return (mopidy.connected) ?
        (
            <AppContainer colors={settings.persistant.colors}>
              <div style={{height: '100%', width: '100%', flexDirection: 'row', display: 'flex'}}>
                <div style={{ width: '50%', height: '100%', overflow: 'auto',
                              scrollbarWidth: 'thin'
                            }}>
                  {activePanel}
                </div>
                <div style={{height: '100%', width: '50%',
                             scrollbarWidth: 'thin'
                            }}>
                  <TracklistPanel/>
                </div>
              </div>
            </AppContainer>
        ) : (
            <AppContainer colors={settings.persistant.colors}>
              <div style={{ width: '50%', height: '100%', overflow: 'auto',
                            scrollbarWidth: 'thin'
                          }}>
                <SettingsPanel/>
              </div>

              <Paper style={{display: 'flex', flexDirection: 'column', width: '50%'}}>
                <div style={{flex: 1}}/>
                <div style={{flex: 1}}><CircularProgress
                                         color="secondary"
                                         style={{margin: 'auto'}}
                                       /></div>
                <div style={{flex: 1}}>
                  <div>Trying to reach mopidy at {settings.persistant.mopidy_ws.current}</div>
                  <div>{mopidy.error}</div>
                </div>
                <div style={{flex: 1}}/>
              </Paper>
            </AppContainer>
        )
}

export default connect(state => {return {settings: state.settings, mopidy: state.mopidy}})(App)
