import { memo, useMemo } from 'react';
import { ThemeProvider, createTheme, makeStyles } from '@mui/material/styles';

import './App.css'

import {HFlex, VFlex} from '@/components/atoms'
import {Footer} from '@/components/panels/footer'
import SidePanel from '@/components/panels/sidePanel'
import {TracklistPanel} from '@/components/panels/tracklist'
import {LibraryPanel} from '@/components/panels/library'
import {SettingsPanel} from '@/components/panels/settings'
import HelpPanel from '@/components/panels/helpPanel'

import CircularProgress from '@mui/material/CircularProgress';

import { StyledEngineProvider } from '@mui/material/styles';

import Color from 'color'
import {HotKeysProvider} from '@/components/molecules/HotKeysProvider'
import {ConfirmDialog} from '@/components/molecules/confirmDialog'
import {match, createCustomTheme} from '@/utils'
import {useSelector } from 'react-redux'
import { useAppState } from './hooks';


let AppContainer = memo(({children}) => {
    const colors = useSelector(
        state => state.settings.persistant.colors
    )

    const text_secondary = useMemo(
        () => (colors.themeType === "light")
            ? (Color(colors.text).lighten(0.25).hex())
            : (Color(colors.text).darken(0.25).hex()),
        [colors]
    )
    const THEME = useMemo(
        () => createCustomTheme(
            colors.themeType, colors.text, text_secondary, colors.primary,
            colors.secondary, colors.background
        ),
        [colors, text_secondary]
    )

    return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={THEME}>
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
            </ThemeProvider>
        </StyledEngineProvider>
    );
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


export const App = memo((
    {
        activePanelName,
        mopidy_ws_url,
        mopidy_connected,
        mopidy_error
    }
) => {
    const activePanel = match(activePanelName)
          .on('control', <SettingsPanel/>)
          .on('help', <HelpPanel/>)
          .on('library', <LibraryPanel/>)
          .otherwise(() => console.log("Bad active panel name", activePanelName))

    return (
            <AppContainer >
              <HFlex style={{height: '100%', width: '100%'}}>
                <div style={{ width: '50%', height: '100%', overflow: 'auto'}}>
                  {(mopidy_connected)
                   ? activePanel
                   : <SettingsPanel/>}
                </div>
                <div style={{height: '100%', width: '50%'}}>
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



export const  AppSmall = memo((
    {
     activePanelName,
     mopidy_ws_url,
     mopidy_connected,
     mopidy_error, dispatch}
) => {
    const activePanel = match(activePanelName)
          .on('control', <SettingsPanel/>)
          .on('help', <HelpPanel/>)
          .on('library', <LibraryPanel/>)
          .on('tracklist', <TracklistPanel/>)
          .otherwise(() => console.log("Bad active panel name", activePanelName))

    return (
            <AppContainer>
              {(mopidy_connected)
               ? activePanel
               : <SettingsPanel/>}
            </AppContainer>
        )
})
