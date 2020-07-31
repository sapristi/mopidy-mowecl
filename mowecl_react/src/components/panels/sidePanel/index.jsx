import React from 'react'
import { connect, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import SettingsIcon from '@material-ui/icons/Settings'
import SearchIcon from '@material-ui/icons/Search'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import Cached from '@material-ui/icons/Cached'

import Paper from '@material-ui/core/Paper'
import Popover from '@material-ui/core/Popover'
import Tooltip from '@material-ui/core/Tooltip'

import CircularProgress from '@material-ui/core/CircularProgress'

import { mdiFileTreeOutline } from '@mdi/js'
import Icon from '@mdi/react'

import { getSearchUris, mowecl_version } from 'utils'

import {SearchInput} from './SearchInput'


const MopidyStatus = ({pendingRequestsNb, connected}) => {

    const style = {marginTop: '15px', marginBottom: '10px'}
    const props = (connected)
          ? ((pendingRequestsNb === 0)
             ? ({variant: 'determinate', value: 100})
             : ({})
            )
          : ({color: "secondary"})

        return (
            <div>
              <CircularProgress size={30}
                                thickness={5}
                                style={style}
                                {...props}
              />
            </div>
        )
}


const SidePanel = (
    {
        uri_schemes,
        dispatch,
        pendingRequestsNb,
        connected,
        search_history_length,
        small_screen
    }
) => {
    const anchorEl = React.useRef(null)
    const [open, setOpen] = React.useState(false)

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
                               target: name
                              })}

    const SearchPopover = () => (
        <Popover
          open={open}
          anchorEl={anchorEl.current}
          onClose={() => setOpen(false)}
          anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
          }}
          transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
          }}
        >
          <SearchInput searchUris={searchUris} mopidy={mopidy}
                       dispatch={dispatch} closePopover={() => setOpen(false)}
                       search_history_length={search_history_length}
          />
        </Popover>

    )


    const refreshAll = async function () {
        await Promise.all( [mopidy.library.refresh(),
                            mopidy.playlists.refresh()])

        mopidy.library.browse({uri: null}).then(
            library =>
                dispatch({
                    type: 'MOPIDY_LIBRARY_INITIALISE',
                    data: library
                }))

        mopidy.playlists.asList().then(
            playlists => 
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    target: ["playlist:"],
                    fun: () => playlists,
                }))
    }

    return (
        <Paper elevation={5}
               style={{display: 'flex', flexDirection: 'column',
                       justifyContent: 'space-between', zIndex: "10"}}
        >
          <ButtonGroup orientation='vertical'>
            <MopidyStatus pendingRequestsNb={pendingRequestsNb}
                          connected={connected}
            />
            <Tooltip title="Quick search">
              <Button ref={anchorEl}
                      id='popover-search-button'
                      onClick={() => setOpen(true)}
              >
                <SearchIcon/>
              </Button></Tooltip>
            <SearchPopover/>

            <Tooltip title="Refresh lib and playlists">
              <Button onClick={refreshAll}>
                <Cached/>
              </Button></Tooltip>
          </ButtonGroup>
          <ButtonGroup orientation='vertical'>

            {
                small_screen &&
                    <Tooltip title="Tracklist panel">
                      <Button onClick={activatePanel('tracklist')}>
                        <QueueMusicIcon/>
                      </Button></Tooltip>
            }

            <Tooltip title="Library panel">
              <Button onClick={activatePanel('library')}>
                <Icon path={mdiFileTreeOutline} size={1}/>
              </Button></Tooltip>

            <Tooltip title="Settings panel">
              <Button style={{height: 'auto'}}
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
            <Button onClick={activatePanel('help')}>
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
            small_screen: state.settings.persistant.generic.small_screen
        }
    ) )(SidePanel)
