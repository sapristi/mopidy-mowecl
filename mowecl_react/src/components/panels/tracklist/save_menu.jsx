import React from 'react'
import { useSelector } from 'react-redux'
import {atom, useRecoilState, useSetRecoilState} from 'recoil'
import MenuItem from '@material-ui/core/MenuItem'

import Popover from '@material-ui/core/Popover'
import SaveIcon from '@material-ui/icons/Save'
import {Input} from 'components/molecules'
import {confirmDialogStateAtom} from 'components/molecules/confirmDialog'

export const defaultMenuState = {
    uri_scheme: null,
    label: null,
    anchorEl: null,
    previousItems: null,
    create_callback: null,
}

export const menuStateAtom = atom({
    key: "playlist_save_menu",
    default: defaultMenuState
})


export const savePlaylist = async (mopidy, uri, tracklist) => {
    const playlist = await mopidy.playlists.lookup({uri})
    playlist.tracks = tracklist.map(tlt => tlt.track)
    return await mopidy.playlists.save({'playlist': playlist})
}

export const createPlaylist = async (mopidy, name, tracklist, uri_scheme) => {
    const playlist = await mopidy.playlists.create({'name': name, 'uri_scheme': uri_scheme})
    return await savePlaylist(mopidy, playlist.uri, tracklist)
}

export const SaveMenu = ({
    tracklist,
}) => {
    const mopidy = useSelector(state => state.mopidy.client)

    const [menuState, setMenuState] = useRecoilState(menuStateAtom)
    const setConfirmDialogState = useSetRecoilState(confirmDialogStateAtom)
    const playlistsAll = useSelector(state => ({
        bookmarks: state.library.bookmarks.children,
        playlists: state.library.playlists.children,
    }))

    const previousItems = playlistsAll[menuState.previousItems] || []

    const saveAction = (name) => {
        const previous_playlist = previousItems.filter(item => item.name === name)
        if (previous_playlist.length > 0) {
            setConfirmDialogState({
                text: `Overwrite ${menuState.label} ${name} ?`,
                callback: () => {
                    savePlaylist(mopidy, previous_playlist[0].uri, tracklist).then(
                        playlist => menuState.create_callback(playlist)
                    )
                }
            })
        } else {
            console.log("Creating", name, menuState.uri_scheme)
            createPlaylist(mopidy, name, tracklist, menuState.uri_scheme).then(
                playlist => menuState.create_callback(playlist)
            )
        }
        setMenuState(defaultMenuState)
    }

    return (
        <Popover
          anchorEl={menuState.anchorEl}
          open={Boolean(menuState.anchorEl)}
          onClose={ () => setMenuState(defaultMenuState)}
          onKeyPress={()=>{}}
        >
          <MenuItem>
            <Input
              label={"New " + menuState.label}
              icon={<SaveIcon/>}
              action={saveAction}/>
          </MenuItem>
          {
              previousItems.map(
                      item =>
                          <MenuItem key={item.uri}
                                    onClick={() => saveAction(item.name)}>
                            {item.name}
                          </MenuItem>
                  )
          }
        </Popover>)
 }
