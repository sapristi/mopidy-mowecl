import React from 'react'
import { connect } from 'react-redux'


import './App.css'
import Footer from './components/panels/footer'

import SidePanel from './components/panels/sidePanel'
import TracklistPanel from './components/panels/tracklist'
import LibraryPanel from './components/panels/library'
import SettingsPanel from './components/panels/settings'
import HelpPanel from './components/panels/helpPanel'

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Color from 'color'
import {HotKeysProvider} from './components/molecules/HotKeysProvider'

import {useTraceUpdate} from './utils'

let AppContainer = ({colors, children}) => {


    const text_secondary = (colors.themeType === "light")
          ? (Color(colors.text).lighten(0.25).hex())
          : (Color(colors.text).darken(0.25).hex())
    // console.log("COLORS", colors)
    const THEME = createMuiTheme({
        palette: {
            type: colors.themeType,
            background: {
                paper: colors.background,
                default: colors.background,
            },
            primary: {
                main: colors.primary
            },
            text: {
                primary: colors.text,
                secondary: text_secondary,
            }
        },
        overrides: {
            MuiLinearProgress: {
                colorPrimary: {
                    backgroundColor: colors.background
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
          <HotKeysProvider/>
          <div className="App"
               style={{display: 'flex', flexDirection: 'column',
                       height:'100%', overflow: 'hidden',
                       backgroundColor: colors.background,
                       scrollbarColor: `${colors.text} ${colors.background}`,
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

let App = ({settings, mopidy_connected, mopidy_error, dispatch}) => {
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

    useTraceUpdate({mopidy_connected, mopidy_error})

    return (mopidy_connected) ?
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
                  <div>Trying to reach mopidy at {settings.persistant.mopidy_ws}</div>
                  <div>{mopidy_error}</div>
                </div>
                <div style={{flex: 1}}/>
              </Paper>
            </AppContainer>
        )
}

export default connect(
    state =>
        ({settings: state.settings,
          mopidy_connected: state.mopidy.connected,
          mopidy_error: state.mopidy_error
         })
)(App)
