import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {HFlex, VFlex} from '@/components/atoms'
import {useSelector} from 'react-redux'
import {useSetRecoilState} from 'recoil'
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

import {Track} from '@/components/molecules'
import {duration_to_human} from '@/utils'
import {AddUriMenu} from './add_uri_menu'
import {SaveMenu, menuStateAtom} from './save_menu'
import Handlebars from "handlebars";

import Color from 'color'
import styled from '@emotion/styled'

const tracklistSwap = (e, mopidy) => {
    // console.log(e)
    mopidy.tracklist.move({start: e.oldIndex, end: e.oldIndex, to_position: e.newIndex})
}

const itemToText = (item) => {

    try {

        const template_str = useSelector(state => state.settings.persistant.generic.tracklist_template)
        const template = Handlebars.compile(template_str.replaceAll("{", "{{{").replaceAll("}", "}}}"));
        const artist = item.track.artists[0].name
        const album = item.track.album.name
        const date = item.track.album.date
        const trackno = item.track.track_no
        const title = item.track.name

        return template({artist, album, trackno, title, date})

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

const TracklistItem = memo(({item, color, current_tlid, mopidy}) => (
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
), equal)


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
             >
               {tracklist.map(item => (
                   <TracklistItem item={item}
                                  key={item.tlid}
                                  current_tlid={current_tlid} mopidy={mopidy}/>
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
    const setSaveMenuState = useSetRecoilState(menuStateAtom)
    const [addMenuState, setAddMenuState] = useState(false)

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
            <SaveMenu/>
            <AddUriMenu anchorElRef={anchorElRef}
                        mopidy={mopidy}
                        menuState={addMenuState}
                        setMenuState={setAddMenuState}
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
