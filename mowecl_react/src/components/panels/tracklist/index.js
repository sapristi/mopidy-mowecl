import React from 'react'
import {connect, useSelector} from 'react-redux'
import {useSetRecoilState} from 'recoil'
import { ReactSortable } from "react-sortablejs"

import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import AudiotrackIcon from '@material-ui/icons/Audiotrack'
import ClearAllIcon from '@material-ui/icons/ClearAll'
import ClearIcon from '@material-ui/icons/Clear'
import SyncIcon from '@material-ui/icons/Sync'
import { mdiBookmarkMusicOutline } from '@mdi/js'
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder'
import AddIcon from '@material-ui/icons/Add'

import Tooltip from '@material-ui/core/Tooltip'
import Chip from '@material-ui/core/Chip'
import Paper from '@material-ui/core/Paper'
import Icon from '@mdi/react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import {Track} from 'components/molecules'
import {duration_to_human} from 'utils'
import {AddUriMenu} from './add_uri_menu'
import {SaveMenu, menuStateAtom} from './save_menu'

import Color from 'color'
import styled from '@emotion/styled'

const tracklistSwap = (e, mopidy) => {
    // console.log(e)
    mopidy.tracklist.move({start: e.oldIndex, end: e.oldIndex, to_position: e.newIndex})
}

const itemToText = (item) => {
    try {
        return `${item.track.album.name} / ${item.track.track_no}. ${item.track.name}`
    }
    catch (e) {
        return item.track.name || item.track.uri
    }
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

const TracklistItem = ({item, color, current_tlid, mopidy}) => (
    <TracklistItemContainer
      color={color}
      key={item.tlid}
    >
      {
          (item.tlid === current_tlid)
              ? <AudiotrackIcon fontSize="small" color="primary"/>
              : ''
      }
      <ListItemText>
        <Track text={itemToText(item)}
               duration={duration_to_human(
                   item.track.length,
                   '∞')} />
      </ListItemText>
      <ListItemIcon>
        <ButtonGroup>
          <Button onClick={() => mopidy.playback.play({tlid: item.tlid})}>
            <PlayArrowIcon fontSize="small"/>
          </Button>
          <Button onClick={() => mopidy.tracklist.remove({
              criteria: {tlid: [item.tlid]}
          })}>
            <ClearIcon fontSize="small"/>
          </Button></ButtonGroup>
      </ListItemIcon>
    </TracklistItemContainer>
)


let TracklistListPanel = ({tracklist, current_tlid}) => {

    const mopidy = useSelector(state => state.mopidy.client)
    const colors = useSelector(state => state.settings.persistant.colors)
    const disableDnd = useSelector(state => state.settings.persistant.generic.disable_dnd)

    return (disableDnd)
        ? (
            <List
              style={{overflow: 'auto', maxHeight: '100%', padding: 0, scrollbarWidth: 'thin'}}
            >
              {tracklist.map(item => (
                  <TracklistItem item={item} color={colors.primary} key={item.tlid}
                                 current_tlid={current_tlid} mopidy={mopidy}/>
              ))}
            </List>
        )
        : (
             <ReactSortable
               list={tracklist}
               setList={() => {}}
               tag={List}
               style={{overflow: 'auto', maxHeight: '100%', padding: 0, scrollbarWidth: 'thin'}}
               group={{name: 'tracklist', pull: true, put: ['library']}}
               onEnd={(e) => tracklistSwap(e, mopidy)}
             >
               {tracklist.map(item => (
                   <TracklistItem item={item} color={colors.primary} key={item.tlid}
                                  current_tlid={current_tlid} mopidy={mopidy}/>
              ))}
            </ReactSortable>
    )
}


const TracklistInfoPanel = ({tracklist}) => {

    const mopidy = useSelector(state => state.mopidy.client)
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const currentBookmark = useSelector(state => state.bookmarksState.currentBookmark)
    const anchorElRef = React.useRef(null)
    const setSaveMenuState = useSetRecoilState(menuStateAtom)
    const [addMenuState, setAddMenuState] = React.useState(false)

    return (
        <Paper style={{paddingLeft: '10px', display: 'flex',
                     flexDirection: 'row', alignItems: 'center',
                     justifyContent: 'space-between'
                      }}>
          <div>
            {tracklist.length} tracks
          </div>
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
              <Button onClick={() => setAddMenuState(true)}>
                <AddIcon fontSize="small"/>
              </Button>
            </Tooltip>

            <Tooltip title="Clear tracklist">
              <Button onClick={() => mopidy.tracklist.clear()}>
                <ClearAllIcon fontSize="small"/>
              </Button>
            </Tooltip>
            <Tooltip title="Save as playlist">
              <Button onClick={() => setSaveMenuState({
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
              <Button onClick={() => setSaveMenuState({
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
            <SaveMenu tracklist={tracklist}/>
            <AddUriMenu anchorElRef={anchorElRef}
                        mopidy={mopidy}
                        menuState={addMenuState}
                        setMenuState={setAddMenuState}
            />
          </ButtonGroup>
        </Paper>)
}


let TracklistPanel = ({tracklist, current_tlid}) => {

    return (
        <Paper
          style={{display: 'flex', flexDirection: 'column', height: '100%',
                  paddingLeft: '5px', marginLeft: '5px', width: "100%" }}>
          <TracklistInfoPanel
            tracklist={tracklist}
          />
          <TracklistListPanel tracklist={tracklist}
                              current_tlid={current_tlid}
                  />
        </Paper>
    )
}



const getTracklistState = (state) => {

    return {tracklist: state.tracklist,
            current_tlid: (state.playback_state.tltrack) ? state.playback_state.tltrack.tlid : null,
           };};
TracklistPanel = connect(getTracklistState)(TracklistPanel);

export default TracklistPanel;
