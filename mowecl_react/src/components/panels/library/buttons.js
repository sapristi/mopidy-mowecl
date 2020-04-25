
import React from 'react'

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';
import AddIcon from '@material-ui/icons/Add';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';



import TextField from '@material-ui/core/TextField';


import {AppContext} from 'utils'

import { isLeaf, expand_node, addToTracklist } from './functions'


const PlayNowButton = ({node, ...props}) => {
    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
        <Tooltip title="Play now !">
          <Button {...props}
                  onClick={() => {
                      dispatch({type: 'TRACKLIST_UNSYNC'})
                      mopidy.tracklist.clear()
                      addToTracklist(node, 0, mopidy).then(
                          (tltracks) => {
                              if (node.current_track_index) {
                                  const tlid = tltracks[node.current_track_index].tlid
                                  console.log("CURRENT", tltracks, node.current_track_index, tlid)

                                  mopidy.playback.play({tlid})
                              } else {  mopidy.playback.play() }
                          }
                      )
                  }}>
            <PlaylistPlayIcon />
          </Button>
        </Tooltip>

    )
}

const AddToTLButton = ({node, ...props}) => {
    const { mopidy } = React.useContext(AppContext)
    return (
        <Tooltip title="Add to tracklist">
          <Button {...props}
                  onClick={ async () => {
                      const uris = await expand_node(node, mopidy)
                      console.log("Add", uris)
                      mopidy.tracklist.add({
                          uris: uris,
                      })
                  }}>
            <PlaylistAddIcon/>
          </Button>
        </Tooltip>

    )
}

const PlayTLSyncedButton = ({node, ...props}) => {
    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
        <Tooltip title="Play synced">
          <Button {...props} onClick={() => {
              mopidy.tracklist.clear()
              dispatch({type: 'TRACKLIST_SYNC', data: node.uri})
              addToTracklist(node, 0, mopidy).then(
                  () => mopidy.playback.play()
              )
          }}>
            <PlaylistPlayIcon />
          </Button>
        </Tooltip>
    )
}


const PlayPLSyncedButton = ({node, ...props}) => {
    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
        <Tooltip title="Play synced">
          <Button {...props} onClick={() => {
              mopidy.tracklist.clear()
              addToTracklist(node, 0, mopidy).then(
                  (pl_uris) => {
                      dispatch({type: 'PLAYLIST_SYNC', data: {...node, children: pl_uris}})
                      mopidy.playback.play()}
              )
          }}>
            <PlaylistPlayIcon />
          </Button>
        </Tooltip>
    )
}

const DeleteTLButton = ({node, ...props}) => {

    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
    <Tooltip title={"Delete tracklist " + node.name}>
      <Button onClick={() => {
          dispatch({type: 'TRACKLIST_DELETE', data: node.uri})

      }} {...props}>
        <DeleteOutlineIcon/>
      </Button>
    </Tooltip>
    )
}

const DeleteBMButton = ({node, ...props}) => {

    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
        <Tooltip title={"Delete bookmark " + node.name}>
          <Button onClick={() => {
              dispatch({type: 'BOOKMARK_DELETE', target: node.uri})

          }} {...props}>
            <DeleteOutlineIcon/>
          </Button>
        </Tooltip>
    )
}

const DeletePLButton = ({node, ...props}) => {

    const { mopidy, dispatch } = React.useContext(AppContext)
    return (
        <Tooltip title={"Delete playlist " + node.name}>
          <Button onClick={() => {
              mopidy.playlists.delete({uri: node.uri})
              mopidy.playlists.asList().then(
                  playlists_updated => dispatch({
                      type: 'LIBRARY_UPDATE_CHILDREN',
                      target: ['playlist:'],
                      data: playlists_updated
                  })
              )
          }} {...props}>
            <DeleteOutlineIcon/>
          </Button>
        </Tooltip>
    )
}


export const DefaultButtons = ({node}) => {

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <PlayNowButton node={node}/>
            <AddToTLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}

export const TLsRootButtons = () => {

    const { mopidy, dispatch } = React.useContext(AppContext)
    const [inputOpen, setInputOpen] = React.useState(false)
    const [input, setInput] = React.useState("")

    const inputRef = React.useRef(null)

    const triggerCreateTracklist = () => {
        if (input.length === 0) return
        dispatch({
            type: "TRACKLIST_CREATE",
            data: input
        })

    }

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <Tooltip title="Create new tracklist">
              <Button onClick={() => {setInputOpen(!inputOpen)}}>
                {
                    inputOpen ?
                        <ClearIcon/> :
                    <AddIcon/>
                }
              </Button>
            </Tooltip>
          {
          inputOpen &&
                  <TextField label="Tracklist name" variant="outlined" size="small"
                             onChange={(event) => setInput(event.target.value)}
                             onKeyPress={(event) => {
                                 if (event.key !== 'Enter') return 
                                 triggerCreateTracklist(event.key)
                                 setInputOpen(false)
                             }}
                             autoFocus={true}
                             ref={inputRef}
                  />
        }
          </ButtonGroup>
        </ListItemIcon>
    )
}

export const TLButtons = ({node}) => {

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <PlayTLSyncedButton node={node}/>
            <AddToTLButton node={node}/>
            <DeleteTLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}

export const BMButtons = ({node}) => {

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <PlayNowButton node={node}/>
            <AddToTLButton node={node}/>
            <DeleteBMButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}


export const PLButtons = ({node}) => {

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <PlayNowButton node={node}/>
            {/* <PlayPLSyncedButton node={node}/> */}
            <AddToTLButton node={node}/>
            <DeletePLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}


export const PLsRootButtons = () => {

    const { mopidy, dispatch } = React.useContext(AppContext)
    const [inputOpen, setInputOpen] = React.useState(false)
    const [input, setInput] = React.useState("")

    const inputRef = React.useRef(null)

    const triggerCreatePlaylist = () => {
        if (input.length === 0) return
        mopidy.playlists.create({'name': input, 'uri_scheme': 'm3u'}).then(
            () => {
                mopidy.playlists.asList().then(
                    playlists => dispatch({
                        type: 'LIBRARY_UPDATE_CHILDREN',
                        target: ["playlist:"],
                        data: playlists,
                    }))
            })}

    return (
        <ListItemIcon>
          <ButtonGroup size="small">
            <Tooltip title="Create new Playlist">
              <Button onClick={() => {setInputOpen(!inputOpen)}}>
                {
                    inputOpen ?
                        <ClearIcon/> :
                    <AddIcon/>
                }
              </Button>
            </Tooltip>
          {
          inputOpen &&
                  <TextField label="Playlist name" variant="outlined" size="small"
                             onChange={(event) => setInput(event.target.value)}
                             onKeyPress={(event) => {
                                 if (event.key !== 'Enter') return 
                                 triggerCreatePlaylist(event.key)
                                 setInputOpen(false)
                             }}
                             autoFocus={true}
                             ref={inputRef}
                  />
        }
          </ButtonGroup>
        </ListItemIcon>
    )
}

