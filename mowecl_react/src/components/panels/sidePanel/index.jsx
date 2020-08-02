import React from 'react'
import { connect, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import SettingsIcon from '@material-ui/icons/Settings'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'

import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'

import { mdiFileTreeOutline } from '@mdi/js'
import Icon from '@mdi/react'

import {SidePanelUpper} from './upper'
import { getSearchUris, mowecl_version } from 'utils'


const SidePanel = (
    {
        uri_schemes,
        dispatch,
        pendingRequestsNb,
        connected,
        search_history_length,
        small_screen,
        current_panel
    }
) => {

    const [availableVersion, setAvailableVersion] = React.useState(() => null)

    const mopidy = useSelector(state => state.mopidy.client)
    if (!availableVersion) {
        fetch('https://pypi.org/pypi/Mopidy-Mowecl/json').then(
            response =>  response.json().then(
                data => setAvailableVersion(data.info.version)
            ))}

    const searchUris = getSearchUris(uri_schemes)

    const activatePanel = function (name) {
        return () => dispatch({type: 'ACTIVE_PANEL',
                               target: name })}

    const getButtonColor = React.useCallback(
        (panelName) => ((panelName === current_panel)
                        ? "primary"
                        : "default"),
        [current_panel]
    )

    return (
        <Paper elevation={5}
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
                (mowecl_version !== availableVersion) && (availableVersion) && 
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
        </Paper>
    )
}

export default connect(
    state => (
        {
            ...state.mopidy,
            search_history_length: state.settings.persistant.generic.search_history_length,
            uri_schemes: state.settings.uri_schemes,
            small_screen: state.settings.persistant.generic.small_screen,
            current_panel: state.settings.active_panel,
        }
    ) )(SidePanel)
