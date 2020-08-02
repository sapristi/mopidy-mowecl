import React from 'react'
import {connect} from 'react-redux'

import CircularProgress from '@material-ui/core/CircularProgress'
import Popover from '@material-ui/core/Popover'

import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import SearchIcon from '@material-ui/icons/Search'
import Cached from '@material-ui/icons/Cached'

import {SearchInput} from './SearchInput'

const MopidyStatus = ({pendingRequestsNb, connected}) => {

    const style = {marginTop: '15px', marginBottom: '10px'}
    const props = (connected)
          ? ((pendingRequestsNb === 0)
             ? ({variant: 'determinate', value: 100})
             : ({disableShrink: true})
            )
          : ({color: "secondary", disableShrink: true})

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

const SearchPopover = ({open, anchorEl, setOpen}) => (
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
      <SearchInput closePopover={() => setOpen(false)} />
    </Popover>

)

const refreshAll = async function (mopidyCli, dispatch) {
    await Promise.all( [mopidyCli.library.refresh(),
                        mopidyCli.playlists.refresh()])

    mopidyCli.library.browse({uri: null}).then(
        library =>
            dispatch({
                type: 'MOPIDY_LIBRARY_INITIALISE',
                data: library
            }))

    mopidyCli.playlists.asList().then(
        playlists => 
            dispatch({
                type: 'LIBRARY_SET_CHILDREN',
                target: ["playlist:"],
                fun: () => playlists,
            }))
}

export const SidePanelUpper = connect(
    state => ({
        mopidyCli: state.mopidy.client,
        pendingRequestsNb: state.mopidy.pendingRequestsNb + state.bookmarks.pendingRequestsNb,
        connected: state.mopidy.connected
    })
)(React.memo(({mopidyCli, pendingRequestsNb, connected, dispatch}) => {
    const anchorEl = React.useRef(null)
    const [open, setOpen] = React.useState(false)
    return (
        <ButtonGroup orientation='vertical'>
          <MopidyStatus pendingRequestsNb={pendingRequestsNb} connected={connected}/>
          <Tooltip title="Quick search">
            <Button ref={anchorEl}
                    id='popover-search-button'
                    onClick={() => setOpen(true)}
            >
              <SearchIcon/>
            </Button></Tooltip>
          <SearchPopover open={open} setOpen={setOpen} anchorEl={anchorEl}/>
          <Tooltip title="Refresh lib and playlists">
            <Button onClick={() => refreshAll(mopidyCli, dispatch)}>
              <Cached/>
            </Button></Tooltip>
        </ButtonGroup>
    )
}))

