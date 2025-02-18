import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {connect} from 'react-redux'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'

import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'

import { mdiFileTreeOutline } from '@mdi/js'
import Icon from '@mdi/react'

import {SidePanelUpper} from './upper'


const SidePanel = (
    {
        uri_schemes,
        dispatch,
        search_history_length,
        small_screen,
        current_panel
    }
) => {

    const [availableVersion, setAvailableVersion] = useState(() => null)

    if (!availableVersion) {
        fetch('https://pypi.org/pypi/Mopidy-Mowecl/json').then(
            response =>  response.json().then(
                data => setAvailableVersion(data.info.version)
            ))}

    const activatePanel = function (name) {
        return () => dispatch({type: 'ACTIVE_PANEL',
                               target: name })}

    const getButtonColor = useCallback(
        (panelName) => ((panelName === current_panel)
                        ? "primary"
                        : "default"),
        [current_panel]
    )

    return (
        (<Paper elevation={5}
                                                                                                                                                                                                                                                                                                                                           style={{display: 'flex', flexDirection: 'column',
                                                                                                                                                                                                                                                                                                                                                   justifyContent: 'space-between', zIndex: "10"}}
                                                                                                                                                                                                                                                                                                                                    >
            <SidePanelUpper/>
            <ButtonGroup orientation='vertical'>

              {
                  small_screen &&
                      <Tooltip title="Tracklist panel">
                        <Button onClick={activatePanel('tracklist')}
                                color={getButtonColor("tracklist")}>
                          <QueueMusicIcon/>
                        </Button></Tooltip>
              }

              <Tooltip title="Library panel">
                <Button onClick={activatePanel('library')}
                        color={getButtonColor("library")}>
                  <Icon path={mdiFileTreeOutline} size={1}/>
                </Button></Tooltip>

              <Tooltip title="Settings panel">
                <Button style={{height: 'auto'}}
                        color={getButtonColor("control")}
                        onClick={activatePanel('control')}>
                  <SettingsIcon/>
                </Button></Tooltip>

            </ButtonGroup>
            <ButtonGroup orientation="vertical">
              {
                  (window.mowecl_version !== availableVersion) && (availableVersion) && 
                      <Tooltip title={`Version ${availableVersion} available on Pypi.`}>
                        <Button
                          href={"https://github.com/sapristi/mopidy-mowecl/tree/master#v" + availableVersion.replace(/\./g, '')}
                          target="_blank"
                           rel="noopener noreferrer"
                        >
                          <ErrorOutlineIcon/>
                        </Button>
                      </Tooltip>
              }
              <Button onClick={activatePanel('help')}
                      color={getButtonColor("help")}
              >
                <HelpOutlineIcon/>
              </Button>
            </ButtonGroup>
        </Paper>)
    );
}

export default connect(
    state => (
        {
            search_history_length: state.settings.persistant.generic.search_history_length,
            uri_schemes: state.settings.uri_schemes,
            small_screen: state.settings.persistant.generic.small_screen,
            current_panel: state.settings.active_panel,
        }
    ) )(SidePanel)
