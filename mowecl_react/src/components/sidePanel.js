import React from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SettingsIcon from '@material-ui/icons/Settings';
import ListIcon from '@material-ui/icons/List';
import SearchIcon from '@material-ui/icons/Search';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import {getSearchUris} from '../utils.js'

const SearchPopOver = ({mopidy, searchUris, dispatch, closePopover}) => {

    const initialSelecterUri = localStorage.getItem("searchSelectedURI") || "all"

    const [selectedUri, setSelectedUri] = React.useState(initialSelecterUri)
    const [input, setInput] = React.useState('')

    const triggerSearch = (key) => {
        if (key !== 'Enter') return 
        if (input.length === 0) return

        const uri = (selectedUri === "all") ? {} : {uris: [selectedUri + ':']}
        // console.log("Search:",  {query: {any: input}, ...uri})
        mopidy.library.search({query: {any: input}, ...uri}).then(
            search_result => {

                const children = search_result.map(
                    item => ({...item, name: item.uri, children: item.tracks,
                              type: 'search_result', expanded: true}))
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: () => children,
                    target: ['search:'],
                })
                dispatch({
                    type: 'LIBRARY_SET_EXPANDED',
                    target: ['search:'],
                    data: true
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

    if (!connected)
        return (
            <div>
              <CircularProgress size={30}
                                thickness={5}
                                style={{marginTop: '10px', marginBottom: '10px'}}
                                color="secondary"
              />
            </div>
        )
    if (pendingRequestsNb === 0)
        return (
            <div>
              <CircularProgress size={30}
                                thickness={5}
                                style={{marginTop: '10px', marginBottom: '10px'}}
                                variant="determinate" value={100}
              />
            </div>
        )

    return (
        <div>
          <CircularProgress size={30}
                            thickness={5}
                            style={{marginTop: '10px', marginBottom: '10px'}}
          />
        </div>
    )
}


const SidePanel = ({dispatch, mopidy, uri_schemes, pendingRequestsNb, connected}) => {

    const anchorEl = React.useRef(null)
    const [open, setOpen] = React.useState(false)
    
    const searchUris = getSearchUris(uri_schemes)

    return (
        <Paper elevation={3}
        style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}
        >
          <ButtonGroup orientation='vertical'>
            <MopidyStatus pendingRequestsNb={pendingRequestsNb}
                          connected={connected}
            />

            <Button style={{height: 'auto'}}
                    onClick={
                        () =>
                            dispatch({
                                type: 'ACTIVATE_PANEL',
                                target: 'control'
                            })
                    }
            >
              <SettingsIcon/>
            </Button>
            <Button onClick={
                () => dispatch({
                    type: 'ACTIVATE_PANEL',
                    target: 'library'
                    
                })}>
              <ListIcon/>
            </Button>
            <Button ref={anchorEl}
                    id='popover-search-button'
                    onClick={() => setOpen(true)}
            >
              <SearchIcon/>
            </Button>
            <Popover
              id="search-popover"
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
              <SearchPopOver searchUris={searchUris} mopidy={mopidy}
                             dispatch={dispatch} closePopover={() => setOpen(false)} />
            </Popover>

          </ButtonGroup>
        <ButtonGroup>


            <Button onClick={() => dispatch({
                type: 'ACTIVATE_PANEL',
                target: 'help'
            })}>
              <HelpOutlineIcon/>
            </Button>
          </ButtonGroup>
        </Paper>
    )
}

export default connect(state => state.mopidy )(SidePanel)
