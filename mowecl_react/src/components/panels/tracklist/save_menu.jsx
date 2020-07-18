import React from 'react';
import { useSelector } from 'react-redux'
import MenuItem from '@material-ui/core/MenuItem';

import Popover from '@material-ui/core/Popover';
import SaveIcon from '@material-ui/icons/Save';
import {Input} from 'components/molecules'


export const savePlaylist = async (mopidy, playlist, tracklist) => {
    playlist.tracks = tracklist.map(tlt => tlt.track)
    return await mopidy.playlists.save({'playlist': playlist})
}

export const createPlaylist = async (mopidy, name, tracklist, uri_scheme) => {
    const playlist = await mopidy.playlists.create({'name': name, 'uri_scheme': uri_scheme})
    return await savePlaylist(mopidy, playlist, tracklist)
}


export const SaveMenu = ({menuState, setMenuState, anchorElRef, playlists, tracklist}) => {
    const mopidy = useSelector(state => state.mopidy.client)

    const saveAsNewPlaylist = (playlistName) => {
        if (!playlistName || playlistName.length === 0) return
        if (playlists.children.map(pl => pl.name).includes(playlistName)) {
            console.log("Playlist ", playlistName, "already exists!")
            return
        }

        createPlaylist(mopidy, playlistName, tracklist, "m3u")
    }

    const MainMenu = () => <Popover
      anchorEl={anchorElRef.current}
      keepMounted
      open={(menuState === "menu")}
      onClose={ () => setMenuState(false)}
    >
      <MenuItem>
        <Input icon={<SaveIcon/>}
               label={"New Playlist"} action={(name) => {
                   saveAsNewPlaylist(name)
                   setMenuState(null)}}/>
      </MenuItem>
      <MenuItem onClick={event => setMenuState("submenu")}>
        Overwrite Playlist
      </MenuItem>
    </Popover>


    const PlMenuItem = (item) => {
        const action = () => {
            savePlaylist(mopidy, item, tracklist)
            setMenuState(null)
        }

        return (
            <MenuItem onClick={action}>
              {item.name}
            </MenuItem>)
    }

    const SaveSubMenu = () =>
        <Popover
          anchorEl={anchorElRef.current}
          keepMounted
          open={(menuState === "submenu")}
          onClose={ () => setMenuState(false)}
        >
          {
              playlists.children &&
                  playlists.children.map(
                      item => <PlMenuItem key={item.uri} item={item}/>
                  )
          }
        </Popover>


    if (menuState === "menu") {
        return <MainMenu/>
    } else {return <SaveSubMenu/>}
}
