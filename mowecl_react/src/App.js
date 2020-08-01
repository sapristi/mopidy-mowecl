import React from 'react'
import { connect } from 'react-redux'

import './App.css'

import {HFlex, VFlex} from 'components/atoms'
import Footer from './components/panels/footer'
import SidePanel from './components/panels/sidePanel'
import TracklistPanel from './components/panels/tracklist'
import { LibraryPanel } from './components/panels/library'
import {SettingsPanel} from './components/panels/settings'
import HelpPanel from './components/panels/helpPanel'

import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import Color from 'color'
import {HotKeysProvider} from './components/molecules/HotKeysProvider'
import {ConfirmDialog} from 'components/molecules/confirmDialog'
import {useTraceUpdate, getWsAddress, match} from './utils'

let AppContainer = React.memo(({colors, children}) => {
    const text_secondary = (colors.themeType === "light")
          ? (Color(colors.text).lighten(0.25).hex())
          : (Color(colors.text).darken(0.25).hex())
    // console.log("COLORS", colors)
    const THEME = createMuiTheme({
        props: {
            MuiButtonBase: {
                disableRipple: false,
                focusRipple: false,
            },
        },
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
          <VFlex className="App"
               style={{height:'100%', overflow: 'hidden',
                       backgroundColor: colors.background,
                       scrollbarColor: `${colors.text} ${colors.background}`,
                       scrollbarWidth: 'thin',
                       textAlign: 'center'
                      }}>
            <ConfirmDialog/>
            <HFlex style={{minHeight: '0', flex: 1, alignItems: "normal"}}>
              <SidePanel/>
              {children}
            </HFlex>
            <Footer style={{display: 'flex', flex: 1, }}/>
          </VFlex>
        </MuiThemeProvider>
    )
})

const ErrorPanel = ({mopidy_ws_url, mopidy_error}) => (
    <VFlex style={{width: '100%', height: "100%"}}>
      <div style={{flex: 1}}/>
      <div style={{flex: 1}}><CircularProgress
                                         color="secondary"
                                         style={{margin: 'auto'}}
            /></div>
      <div style={{flex: 1}}>
        <div>Trying to reach mopidy at {mopidy_ws_url}</div>
        <div>{mopidy_error}</div>
      </div>
      <div style={{flex: 1}}/>
    </VFlex>
)


export const App = React.memo((
    {active_panel_name,
     colors, mopidy_ws_url,
     mopidy_connected,
     mopidy_error, dispatch}
) => {
    const activePanel = match(active_panel_name)
          .on('control', <SettingsPanel/>)
          .on('help', <HelpPanel/>)
          .on('library', <LibraryPanel/>)
          .otherwise(() => console.log("Bad active panel name", active_panel_name))

    return (
            <AppContainer colors={colors}>
              <HFlex style={{height: '100%', width: '100%'}}>
                <div style={{ width: '50%', height: '100%'}}>
                  {(mopidy_connected)
                   ? activePanel
                   : <SettingsPanel/>}
                </div>
                <div style={{height: '100%', width: '50%',}}>
                  {(mopidy_connected)
                   ? <TracklistPanel/>
                   : <ErrorPanel
                       mopidy_ws_url={mopidy_ws_url}
                       mopidy_error={mopidy_error}
                     />}
                </div>
              </HFlex>
            </AppContainer>
        )
})



export const  AppSmall = (
    {active_panel_name,
     colors, mopidy_ws_url,
     mopidy_connected,
     mopidy_error, dispatch}
) => {
    const activePanel = match(active_panel_name)
          .on('control', <SettingsPanel/>)
          .on('help', <HelpPanel/>)
          .on('library', <LibraryPanel/>)
          .on('tracklist', <TracklistPanel/>)
          .otherwise(() => console.log("Bad active panel name", active_panel_name))

    return (
            <AppContainer colors={colors}>
              {(mopidy_connected)
               ? activePanel
               : <SettingsPanel/>}
            </AppContainer>
        )
}
