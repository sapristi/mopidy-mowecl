import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'

import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import ClearIcon from '@mui/icons-material/Clear'
import BlurLinearIcon from '@mui/icons-material/BlurLinear';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper'

import equal from 'fast-deep-equal'

import {exploreItem} from '@/components/panels/library/functions.js'
import { useMenuAnchor } from '@/hooks'


const AddToPlaylistMenu = ({item, mopidy, ...props}) => {

    console.log(props)
    const mopidyHost = useSelector(store => store.settings.persistant.mopidy_host)
    const mopidyPort = useSelector(store => store.settings.persistant.mopidy_port)
    const [playlists, setPlaylists] = useState(() => [])
    useEffect(
        () => {
            mopidy.playlists.asList().then(
                playlists => {setPlaylists(playlists.filter(pl_item => pl_item.uri.startsWith("tidal:")))}
            )
        },
        [mopidy]
    )

    const protocol = window.location.protocol
    const url = `${protocol}//${mopidyHost}:${mopidyPort}/tidal/add_to_playlist?`
    const handleAddToPlaylist = (item, pl_item) => {
        const track_uri = item.track.uri
        const playlist_uri = pl_item.uri
        fetch(
            url + new URLSearchParams({playlist_uri, track_uri}).toString()
        ).then((resp) => {
            console.log(resp)
            props.onClose()
        })
        props.onClose()
    }
    return (
        <Menu
          {...props}
          anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
          }}
          transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
          }}
        >
            {
                playlists.map(
                    pl_item =>{
                        const onClick = () => handleAddToPlaylist(item, pl_item)
                        return <MenuItem key={pl_item.uri} onClick={onClick}>Add to {pl_item.name}</MenuItem>
                    }
                )
            }
        </Menu>
    )
}


export const TracklistItemMenu = ({item, mopidy, ...props}) => {

    const dispatch = useDispatch()

    const { menuId, handleClick, menuProps } = useMenuAnchor("add-to-playlist-menu")

    const handleRemoveClick = () => mopidy.tracklist.remove({
        criteria: {tlid: [item.tlid]}
    })
    let exploreArtistsMenuItems = []
    let addToPlaylistMenuButton = null;
    if (item.track.uri.startsWith("tidal:")) {
        exploreArtistsMenuItems = item.track.artists.map(
            (artist) => <MenuItem
                          startIcon={<BlurLinearIcon fontSize="small"/>}
                          onClick={() => exploreItem(artist, dispatch, mopidy)}
                        >Explore {artist.name}</MenuItem>
        )
        addToPlaylistMenuButton = (
            <MenuItem onClick={handleClick}>Add to playlist</MenuItem>
        )
    }


    return (
        <Menu {...props} >
          <MenuItem onClick={handleRemoveClick} startIcon={<ClearIcon fontSize="small"/>}>
            Remove from tracklist
          </MenuItem>
          {...exploreArtistsMenuItems}
          {addToPlaylistMenuButton}
          <AddToPlaylistMenu item={item} mopidy={mopidy} {...menuProps}/>
        </Menu>
    )
}
