import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import CircularProgress from '@mui/material/CircularProgress'
import Popover from '@mui/material/Popover'

import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import SearchIcon from '@mui/icons-material/Search'
import Cached from '@mui/icons-material/Cached'

import {SearchInput} from './SearchInput'

const MopidyStatus = () => {
    const connected = useSelector(state => state.mopidy.connected)
    const pendingRequestsNb = useSelector(state => state.mopidy.pendingRequestsNb + state.bookmarks.pendingRequestsNb,)

    const style = {marginTop: '15px', marginBottom: '10px'}
    const props = (connected)
          ? ((pendingRequestsNb === 0)
             ? ({color: "info", variant: 'determinate', value: 100})
             : ({color: "secondary", disableShrink: true})
            )
          : ({color: "error", disableShrink: true})

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

export const SidePanelUpper = memo(() => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const dispatch = useDispatch()
    const anchorEl = useRef(null)
    const [open, setOpen] = useState(false)
    return (
        <ButtonGroup orientation='vertical'>
          <MopidyStatus/>
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
})

