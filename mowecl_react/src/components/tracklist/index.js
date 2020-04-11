
import React from 'react';
import { connect } from 'react-redux';
import { ReactSortable } from "react-sortablejs";


import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import ClearIcon from '@material-ui/icons/Clear';
import SyncIcon from '@material-ui/icons/Sync';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';

import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import {Track} from '../generic'
import {AppContext, listEquals, duration_to_human} from '../../utils'
import {BookmarkMenu} from './bookmark_menu'
import {SaveMenu, saveAsPlaylist} from './save_menu'

import styled from 'styled-components'

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

const TracklistItem = styled(ListItem)`
padding: 0;
:hover {
    background-color: rgba(63, 81, 181, 0.125);
    border-radius: 5px;
}
`

let TracklistListPanel = ({dispatch, tracklist, current_tlid}) => {
    // console.log("Tracklist", tracklist, current_tlid);

    const { mopidy } = React.useContext(AppContext)

    return (
             <ReactSortable
               list={tracklist}
               setList={() => {}}
               tag={List}
               style={{overflow: 'auto', maxHeight: '100%', padding: 0}}
               group={{name: 'tracklist', pull: true, put: ['library']}}
               onEnd={(e) => tracklistSwap(e, mopidy)}

               id='tracklist'
             >
               {tracklist.map(item => (
                   <TracklistItem
                     key={item.tlid}
                     className={(item.tlid === current_tlid) ?
                                "tracklist_current" : "" }
                   >
                     {(item.tlid === current_tlid) ?
                      <AudiotrackIcon fontSize="small"/>
                      : ''

                     }
                     <ListItemText>
                       <Track text={itemToText(item)}
                              duration={duration_to_human(
                                  item.track.length,
                                  <span style={{fontSize: '100%'}}>∞</span>)} />
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
                   </TracklistItem>
              ))}
            </ReactSortable>
    );
};


let TracklistInfoPanel = ({tracklist, playlists, bookmarks, dispatch}) => {
    const { mopidy } = React.useContext(AppContext)
    const anchorElRef = React.useRef(null)
    const [menuState, setMenuState] = React.useState(null)

    const [prevTracklist, setPrevTracklist] = React.useState(tracklist)
    React.useEffect( () => {
        if (listEquals(tracklist.map(tlt => tlt.track.uri),
                       prevTracklist.map(tlt => tlt.track.uri))) return

        if (playlists.synced) {
            saveAsPlaylist(mopidy, playlists.synced.name, tracklist.map(tlt => tlt.track))
            mopidy.playlists.getItems({uri: playlists.synced.uri}).then(
                items => dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    target: ["playlist:", playlists.synced.uri],
                    fun: () => (items || [])
                })

            )
        }
        setPrevTracklist(tracklist)
    })

    return (
        <Paper style={{paddingLeft: '10px', display: 'flex',
                     flexDirection: 'row', alignItems: 'center',
                     justifyContent: 'space-between'
                    }}>
          {
              playlists.synced &&
                  <Chip icon={<SyncIcon/>}
                        color="primary"
                        onDelete={() => dispatch({type: 'PLAYLIST_UNSYNC'})}
                        style={{float: 'left'}}
                        label={playlists.synced.name}
                        variant='outlined'
                        size="small"
                  />
          }
          <div>
            {tracklist.length} tracks
          </div>
          <ButtonGroup>
            <Tooltip title="Clear playlist">
              <Button onClick={() => {
                  dispatch({type: 'TRACKLIST_UNSYNC'})
                  mopidy.tracklist.clear()}}>
                <ClearAllIcon fontSize="small"/>
              </Button>
            </Tooltip>
            <Tooltip title="Save as...">
              <Button onClick={ (event) => setMenuState("menu") } ref={anchorElRef}>
                <SaveAltIcon/>
              </Button>
            </Tooltip>
            <SaveMenu menuState={menuState} setMenuState={setMenuState}
                      anchorElRef={anchorElRef} playlists={playlists}
                      tracklist={tracklist}
            />
            <Tooltip title="Bookmark current TL and position">
              <Button onClick={(event) => setMenuState("bookmark")}>
                <BookmarkBorderIcon/>
              </Button>
            </Tooltip>
            <BookmarkMenu menuState={menuState} setMenuState={setMenuState}
                          anchorElRef={anchorElRef} tracklist={tracklist}/>
          </ButtonGroup>
        </Paper>)
}
TracklistInfoPanel = connect(state => ({ playlists: state.library.playlists}))(TracklistInfoPanel)


let TracklistPanel = ({tracklist, current_tlid, dispatch, mopidy}) => {

    return (
        <Paper
          style={{display: 'flex', flexDirection: 'column', height: '100%',
                  paddingLeft: '5px', marginLeft: '5px'
                 }}>
          <TracklistInfoPanel
            tracklist={tracklist}
            mopidy={mopidy}
          />
          <TracklistListPanel tracklist={tracklist}
                              current_tlid={current_tlid}
                              dispatch={dispatch}
                              mopidy={mopidy}
                              style={{overflow: 'auto', height: '100%', maxHeight: '100%'}}
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
