import React from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Cached from '@material-ui/icons/Cached';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {getSearchUris} from 'utils'
import {version} from 'package.json'

const SearchInput = ({mopidy, searchUris, dispatch, closePopover, search_history_length}) => {

    const initialSelecterUri = localStorage.getItem("searchSelectedURI") || "all"

    const [selectedUri, setSelectedUri] = React.useState(initialSelecterUri)
    const [input, setInput] = React.useState(() => '')

    const triggerSearch = (key) => {
        if (key !== 'Enter') return
        if (input.length === 0) return

        const uri = (selectedUri === "all") ? {} : {uris: [selectedUri + ':']}
        // console.log("Search:",  {query: {any: [input]}, ...uri})
        mopidy.library.search({query: {any: [input]}, ...uri}).then(
            search_result => {

                const search_results = search_result.map(
                    item => ({...item, name: item.uri, children: item.tracks,
                              type: 'search_result', expanded: true}))
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: () => search_results,
                    target: ['search:'],
                })
                dispatch({
                    type: 'LIBRARY_SET_EXPANDED',
                    target: ['search:'],
                    data: true
                })

                if (search_history_length <= 0)
                    return

                const search_history_name = input + '/' + selectedUri
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: (c) => [{name: search_history_name, uri: search_history_name},
                                 ...c].slice(0, search_history_length),
                    target: ['search_history:']
                })

                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: () => search_results,
                    target: ['search_history:', search_history_name]
                })
            }
        )
        closePopover()
    }

    return (
        <div>
          <TextField id='search-popover-textinput'
                     variant="outlined"
                     value={input} onChange={(event) => setInput(event.target.value)}
                     onKeyPress={event => triggerSearch(event.key)}
                     autoFocus={true}
          />
          <FormControl variant="outlined">
            <Select
              native
              value={selectedUri}
              onChange={ (event) => {
                  localStorage.setItem("searchSelectedURI", event.target.value)
                  setSelectedUri(event.target.value)}}
              onKeyPress={event => triggerSearch(event.key)}
            >
              <option value={"all"}>All</option>
              {
                  searchUris.map(
                      ([uri, uriHuman]) => <option value={uri} key={uri}>{uriHuman}</option>)
              }
            </Select>
          </FormControl>
        </div>)
}


const MopidyStatus = ({pendingRequestsNb, connected}) => {

    const style = {marginTop: '15px', marginBottom: '10px'}

    if (!connected)
        return (
            <div>
              <CircularProgress size={30}
                                thickness={5}
                                style={style}
                                color="secondary"
              />
            </div>
        )
    if (pendingRequestsNb === 0)
        return (
            <div>
              <CircularProgress size={30}
                                thickness={5}
                                style={style}
                                variant="determinate" value={100}
              />
            </div>
        )

    return (
        <div>
          <CircularProgress size={30}
                            thickness={5}
                            style={style}
          />
        </div>
    )
}


const SidePanel = ({dispatch, mopidy, uri_schemes, pendingRequestsNb, connected, search_history_length}) => {

    const anchorEl = React.useRef(null)
    const [open, setOpen] = React.useState(false)

    const [availableVersion, setAvailableVersion] = React.useState(() => null)

    if (!availableVersion) {
        fetch('https://pypi.org/pypi/Mopidy-Mowecl/json').then(
            response =>  response.json().then(
                data => setAvailableVersion(data.info.version)
            ))}

    const searchUris = getSearchUris(uri_schemes)

    const activatePanel = function (name) {
        return () => dispatch({type: 'ACTIVATE_PANEL',
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
                       justifyContent: 'space-between'}}
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

            <Tooltip title="Library panel">
            <Button onClick={activatePanel('library')}>
              <ListIcon/>
            </Button></Tooltip>

            <Tooltip title="Settings panel">
            <Button style={{height: 'auto'}}
                    onClick={activatePanel('control')}>
              <SettingsIcon/>
            </Button></Tooltip>

          </ButtonGroup>

          <ButtonGroup orientation="vertical">
            {
            (version !== availableVersion) &&
            <Tooltip title={`Version ${availableVersion} available on Pypi.`}>
              <Button>
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

export default connect(state => ({...state.mopidy,
                                  search_history_length:
                                  state.settings.persistant.search_history_length.current
                                 }) )(SidePanel)
