
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';

import Popover from '@material-ui/core/Popover';
import SaveIcon from '@material-ui/icons/Save';
import {AppContext} from '../../utils'
import {Input} from '../generic'




const saveAsPlaylist = (mopidy, playlistName, tracks) => {
    mopidy.playlists.create({'name': playlistName, 'uri_scheme': 'm3u'}).then(
        (playlist) => {
            playlist.tracks = tracks
            mopidy.playlists.save({'playlist': playlist}).then()
        })
}



const SaveMenu = ({menuState, setMenuState, anchorElRef, playlists, tracklist}) => {
    const { mopidy } = React.useContext(AppContext)

    const saveAsNewPlaylist = (playlistName) => {
        if (!playlistName || playlistName.length === 0) return
        if (playlists.children.map(pl => pl.name).includes(playlistName)) {
            console.log("Playlist ", playlistName, "already exists!")
            return
        }

        saveAsPlaylist(mopidy, playlistName, tracklist.map(tlt => tlt.track))
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
                      item => (
                          <MenuItem key={item.uri}
                                    onClick={() => {
                                        saveAsPlaylist(mopidy, item.name,
                                                       tracklist.map(tlt => tlt.track))
                                        setMenuState(null)
                                    }}
                          >
                            {item.name}
                          </MenuItem>)
                  )
          }
        </Popover>


    if (menuState === "menu") {
        return <MainMenu/>
    } else {return <SaveSubMenu/>}
}

export {SaveMenu, saveAsPlaylist}
