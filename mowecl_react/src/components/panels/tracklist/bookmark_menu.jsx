import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';

import Popover from '@material-ui/core/Popover';
import SaveIcon from '@material-ui/icons/Save';

import {Input} from 'components/molecules'

export const BookmarkMenu = ({tracklist, menuState, setMenuState, anchorElRef}) => {

    const dispatch = useDispatch()
    const bookmarks = useSelector(state => state.library.bookmarks)
    const bookmarksCli = useSelector(state => state.bookmarks.client)
    const createBookmark = (bookmarkName) =>
          bookmarksCli.createFromTracklist({name: bookmarkName})

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
                  createBookmark(name)
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
                                        createBookmark(item.name)
                                        setMenuState(null)
                                    }}
                          >
                            {item.name}
                          </MenuItem>
                  )
          }
        </Popover>)
}
