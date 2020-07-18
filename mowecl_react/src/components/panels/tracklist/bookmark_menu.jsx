import React from 'react';
import {useSelector} from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';

import Popover from '@material-ui/core/Popover';
import SaveIcon from '@material-ui/icons/Save';

import {Input} from 'components/molecules'

import {savePlaylist, createPlaylist} from './save_menu'

export const BookmarkMenu = ({tracklist, menuState, setMenuState, anchorElRef}) => {

    const bookmarks = useSelector(state => state.library.bookmarks)
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const mopidy = useSelector(state => state.mopidy.client)

    return (
        <Popover
          anchorEl={anchorElRef.current}
          keepMounted
          open={(menuState === "bookmark")}
          onClose={ () => setMenuState(false)}
          onKeyPress={()=>{}}
        >
          <MenuItem>
            <Input
              label={"New Bookmark"}
              icon={<SaveIcon/>}
              action={ (name) => {
                  createPlaylist(mopidy, name, tracklist, "bookmark").then(
                      bookmark => bookmarksCli.startSync({uri: bookmark.uri})
                  )
                  setMenuState(null)
              }
            }/>
          </MenuItem>
          {
              bookmarks.children &&
                  bookmarks.children.map(
                      item =>
                          <MenuItem key={item.uri}
                                    onClick={() => {
                                        savePlaylist(mopidy, item, tracklist)
                                        setMenuState(null)
                                    }}
                          >
                            {item.name}
                          </MenuItem>
                  )
          }
        </Popover>)
}
