import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {atom, useRecoilState, useSetRecoilState} from 'recoil'

import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Popover from '@material-ui/core/Popover'

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
// import AddIcon from '@material-ui/icons/Add'
import ListItemIcon from '@material-ui/core/ListItemIcon'
// import ClearIcon from '@material-ui/icons/Clear'
// import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'

import Icon from '@mdi/react'
import { mdiPlaylistRemove } from '@mdi/js'

import {confirmDialogStateAtom} from 'components/molecules/confirmDialog'
import {expand_node, addToTracklist } from './functions'


const PlayNowButton = ({node, ...props}) => {
    const mopidy = useSelector(state => state.mopidy.client)
    const action = () => {
        mopidy.tracklist.clear()
        addToTracklist(node, 0, mopidy).then(
            (tltracks) => { mopidy.playback.play() }
        )
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
              ? (favorites.filter(c => c.uri != node.uri))
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
