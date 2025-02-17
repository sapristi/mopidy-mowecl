import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {atom, useRecoilState, useSetRecoilState} from 'recoil'

import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'

import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
// import AddIcon from '@mui/icons-material/Add'
import ListItemIcon from '@mui/material/ListItemIcon'
// import ClearIcon from '@mui/icons-material/Clear'
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// import MoreVertIcon from '@mui/icons-material/MoreVert'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

import Icon from '@mdi/react'
import { mdiPlaylistRemove } from '@mdi/js'

import {confirmDialogStateAtom} from '@/components/molecules/confirmDialog'
import {expand_node, addToTracklist,  addToTracklistAndPlay} from './functions'


const PlayNowButton = ({node, ...props}) => {
    const mopidy = useSelector(state => state.mopidy.client)
    const action = () => {
        mopidy.tracklist.clear()
        addToTracklistAndPlay(node, mopidy)
    }

    return (
        <Tooltip title="Play now !">
          <Button {...props} onClick={action}>
            <PlaylistPlayIcon />
          </Button>
        </Tooltip>

    )
}

const AddToTLButton = ({node, ...props}) => {
    const mopidy = useSelector(state => state.mopidy.client)
    const action = () => expand_node(node, mopidy).then(
        (uris) => mopidy.tracklist.add({uris})
    )
    return (
        <Tooltip title="Add to tracklist">
          <Button {...props} onClick={action}>
            <PlaylistAddIcon/>
          </Button>
        </Tooltip>
    )
}


const ResumeBookmarkButton = ({node, ...props}) => {
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const action = () => bookmarksCli.resume({uri: node.uri})
    return (
        <Tooltip title="Resume bookmark">
          <Button {...props} onClick={action}>
            <PlaylistPlayIcon />
          </Button>
        </Tooltip>
    )
}

const DeletePLButton = ({node, ...props}) => {
    const mopidy = useSelector(state => state.mopidy.client)
    // const setExtraButtonsState = useSetRecoilState(extraButtonsState)
    const setConfirmDialogState = useSetRecoilState(confirmDialogStateAtom)
    const callback = () => {
        mopidy.playlists.delete({uri: node.uri})
    }
    const objectName = (node.uri.startsWith("bookmark"))
          ? "bookmark"
          : "playlist"

    const action = () => {
        // setExtraButtonsState({anchorEl: null, children: null})
        setConfirmDialogState({
            text: `Delete ${objectName} ${node.name} ?`,
            callback
        })
    }
    return (
        <Tooltip title={`Delete ${objectName} ` + node.name}>
          <Button {...props} onClick={action}>
            <Icon path={mdiPlaylistRemove} size={1}/>
          </Button>
        </Tooltip>
    )
}

export const FavButton = ({node, ...props}) => {
    const favorites = useSelector(state => state.library.favorites.children)
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const dispatch = useDispatch()

    const alreadyFav = favorites.map(f => f.uri).includes(node.uri)
    const action = () => {
        const newFavs = (alreadyFav)
              ? (favorites.filter(c => c.uri !== node.uri))
              : ([...favorites, node])

        dispatch({
            type: "LIBRARY_SET_CHILDREN",
            target: ["favorite:"],
            fun: () => newFavs
        })
        const newFavs_slim = newFavs.map(f => ({...f, children: undefined, __model__: undefined}))
        bookmarksCli.store.set({key: "favorites", value: newFavs_slim})
    }
    return (
        <IconButton size="small" {...props} onClick={action}
                    style={{marginRight: '10px'}} color="primary"
        >
          {(alreadyFav)
           ? <FavoriteIcon/>
           : <FavoriteBorderIcon/>
          }
        </IconButton>)
}

export const DefaultButtons = ({node}) => {
    return (
        <ListItemIcon>
          <FavButton node={node}/>
          <ButtonGroup size="small">
            <PlayNowButton node={node}/>
            <AddToTLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}

const extraButtonsState = atom({
    key: "libExtraButtons",
    default: {
        anchorEl: null,
        children: null
    }
})

export const ExtraButtonsPopover = ({...props}) => {
    const [{anchorEl, children}, setExtraButtonsState] = useRecoilState(extraButtonsState)
    const open = Boolean(anchorEl)
    const handleClose = () => setExtraButtonsState({anchorEl: null, children: null})
    return (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
          }}
          transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
          }}
        >
          <ButtonGroup size="small">
            {children}
          </ButtonGroup>
        </Popover>
    )
}

// const OpenExtraButton = ({children, ...props}) => {
//     const setExtraButtonsState = useSetRecoilState(extraButtonsState)

//     const action = (event) => {
//         const target = event.currentTarget
//         setExtraButtonsState({anchorEl: target, children})
//     }
//     return (<Button {...props} onClick={action}>
//               <MoreVertIcon/>
//             </Button>)
// }

export const PLButtons = ({node}) => {
    return (
        <ListItemIcon>
          <FavButton node={node}/>
          <ButtonGroup size="small">
            <PlayNowButton node={node}/>
            <AddToTLButton node={node}/>
            <DeletePLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}

export const BMButtons = ({node}) => {
    return (
        <ListItemIcon>
          <FavButton node={node}/>
          <ButtonGroup size="small">
            <ResumeBookmarkButton node={node}/>
            <AddToTLButton node={node}/>
            <DeletePLButton node={node}/>
          </ButtonGroup>
        </ListItemIcon>
    )
}
