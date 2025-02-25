import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {HFlex, VFlex} from '@/components/atoms'
import {useSelector, useDispatch} from 'react-redux'
import { ReactSortable } from "react-sortablejs"

import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import ClearIcon from '@mui/icons-material/Clear'
import SyncIcon from '@mui/icons-material/Sync'
import { mdiBookmarkMusicOutline } from '@mdi/js'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlurLinearIcon from '@mui/icons-material/BlurLinear';

import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Icon from '@mdi/react'

import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import equal from 'fast-deep-equal'

import {duration_to_human} from '@/utils'
import {AddUriMenu} from './add_uri_menu'
import { SaveMenu, usePlaylistSaveMenuStore } from './save_menu'

import Color from 'color'
import styled from '@emotion/styled'

import { TracklistItemMenu} from '@/components/panels/tracklist/track_menu'
import { GIcon } from '@/components/molecules'
import { useMenuAnchor } from '@/hooks'

const tracklistSwap = (e, mopidy) => {
    // console.log(e)
    mopidy.tracklist.move({start: e.oldIndex, end: e.oldIndex, to_position: e.newIndex})
}


export const Track = ({item}) => {

    // line-height: 0px needed to center item vertically
    const sep = <span style={{lineHeight: "0px"}}> ⁕ </span>
    const trackElem = <span>{item.track.name || item.track.uri} </span>
    let artistElem = null
    let albumElem = null

    const duration = duration_to_human(item.track.length,'∞')

    try {
        const artistIcon = <GIcon name="artist" style={{paddingRight: "3px"}}/>
        const artist = item.track.artists[0].name
        artistElem = (<>
                        {sep}
                        {artistIcon}
                        <span>{artist}</span>
                      </>
                     )
    }
    catch (e) {
        console.warn("Failed formatting artist")
    }
    try {
        const albumIcon = <GIcon name="album" style={{paddingRight: "3px"}}/>
        const album = item.track.album.name
        const date = item.track.album.date
        albumElem = (<>
                       {sep}
                       {albumIcon}
                       <span> {album} ({date})</span>
                     </>)
    }
    catch (e) {
        console.warn("Failed formatting album")
    }

    return (
        <HFlex style={{justifyContent: "space-between"}}>
          <HFlex style={{alignItems: "center"}}>
            {trackElem}
            {artistElem}
            {albumElem}
          </HFlex>
          <div style={{textAlign: "right", paddingRight: '4px'}}>
            {duration}
          </div>
        </HFlex>
    )
}


const TracklistItemContainer = styled(ListItem)`
padding: 0;
box-sizing: border-box;
border: 2px solid rgba(0,0,0,0);
border-radius: 5px;
&:hover {
    border: 2px solid ${props => Color(props.color).alpha(0.5).string()};
}
`

const TracklistItem = memo(({item, color, current_tlid, mopidy, sortable}) => {

    const { toggleMenu, menuProps } = useMenuAnchor()

    return (
        <TracklistItemContainer
          color={color}
          key={item.tlid}
        >
          { sortable && <div className="tracklist-handle"><GIcon name="drag_handle"/></div>}
          {
              (item.tlid === current_tlid)
                  ? <AudiotrackIcon fontSize="small" color="primary"/>
                  : ''
          }
          <ListItemText>
            <Track item={item} />
          </ListItemText>
          <ListItemIcon>
            <ButtonGroup>
              <Button onClick={() => mopidy.playback.play({tlid: item.tlid})}>
                <PlayArrowIcon fontSize="small"/>
              </Button>
              <Button type="button" onClick={toggleMenu} color={menuProps.open ? "info" : "default"}>
                <MoreVertIcon/>
              </Button>
              <TracklistItemMenu item={item} mopidy={mopidy} {...menuProps}/>
            </ButtonGroup>
          </ListItemIcon>
        </TracklistItemContainer>
    )
}, equal)


const TracklistListPanel = () => {

    const mopidy = useSelector(state => state.mopidy.client)
    const disableDnd = useSelector(state => state.settings.persistant.generic.disable_dnd)

    const current_tlid = useSelector(state => (state.playback_state.tltrack) ? state.playback_state.tltrack.tlid : null)
    const tracklist = useSelector(state => state.tracklist)
    return (disableDnd)
        ? (
            <List
              style={{overflow: 'auto', maxHeight: '100%', padding: 0, paddingLeft: "5px", }}
            >
              {tracklist.map(item => (
                  <TracklistItem item={item}
                                 key={item.tlid}
                                 current_tlid={current_tlid} mopidy={mopidy}/>
              ))}
            </List>
        )
        : (
             <ReactSortable
               list={tracklist}
               setList={() => {}}
               tag={List}
               style={{overflow: 'auto', maxHeight: '100%', padding: 0, paddingLeft: "5px"}}
               group={{name: 'tracklist', pull: true, put: ['library']}}
               onEnd={(e) => tracklistSwap(e, mopidy)}
               handle=".tracklist-handle"
             >
               {tracklist.map(item => (
                   <TracklistItem item={item}
                                  key={item.tlid}
                                  current_tlid={current_tlid} mopidy={mopidy}
                                  sortable={true}
                   />
              ))}
            </ReactSortable>
    )
}

const TracklistLength = () => {
    const tracklist_length = useSelector(state => state.tracklist.length)
    return (
        <div>
          {tracklist_length} tracks
        </div>

    )
}

const TracklistInfoPanel = () => {

    const mopidy = useSelector(state => state.mopidy.client)
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const currentBookmark = useSelector(state => state.bookmarksState.currentBookmark)
    const anchorElRef = useRef(null)
    const setPlSaveMenuState = usePlaylistSaveMenuStore((state) => state.setState)
    const { toggleMenu, menuProps } = useMenuAnchor()

    return (
        <Paper style={{paddingLeft: '10px', display: 'flex',
                     flexDirection: 'row', alignItems: 'center',
                     justifyContent: 'space-between'
                      }}>
          <TracklistLength/>
          {
              currentBookmark &&
                  <Chip icon={<SyncIcon/>}
                        color="primary"
                        onDelete={() => bookmarksCli.stopSync()}
                        style={{float: 'left'}}
                        label={currentBookmark}
                        variant='outlined'
                        size="small"
                  />
          }
          <ButtonGroup>
            <Tooltip title="Add uri to tracklist">
              <Button onClick={toggleMenu}>
                <AddIcon fontSize="small"/>
              </Button>
            </Tooltip>

            <Tooltip title="Clear tracklist">
              <Button onClick={() => mopidy.tracklist.clear()}>
                <ClearAllIcon fontSize="small"/>
              </Button>
            </Tooltip>
            <Tooltip title="Save as playlist">
              <Button onClick={() => setPlSaveMenuState({
                  uri_scheme: "m3u",
                  label: "Playlist",
                  anchorEl: anchorElRef.current,
                  previousItems: "playlists",
                  create_callback: () => {}
              })} ref={anchorElRef}>
                <BookmarkBorderIcon/>
              </Button>
            </Tooltip>
            <Tooltip title="Save as bookmark and start syncing">
              <Button onClick={() => setPlSaveMenuState({
                  uri_scheme: "bookmark",
                  label: "Bookmark",
                  anchorEl: anchorElRef.current,
                  previousItems: "bookmarks",
                  create_callback: bookmark => {
                      console.log("Start sync", bookmark)
                      bookmarksCli.startSync({uri: bookmark.uri})}
              }
              )}>
                <Icon path={mdiBookmarkMusicOutline} size={1}/>
              </Button>
            </Tooltip>
            <SaveMenu/>
            <AddUriMenu anchorElRef={anchorElRef}
                        mopidy={mopidy}
                        {...menuProps}
            />
          </ButtonGroup>
        </Paper>)
}


export const TracklistPanel = () => {
    return (
        <Paper
          style={{display: 'flex', flexDirection: 'column', height: '100%',
                 }}>
          <TracklistInfoPanel />
          <TracklistListPanel />
        </Paper>
    )
}
