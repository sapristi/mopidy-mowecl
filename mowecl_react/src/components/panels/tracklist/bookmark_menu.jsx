
import React from 'react';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';

import Popover from '@material-ui/core/Popover';
import SaveIcon from '@material-ui/icons/Save';

import {Input} from 'components/molecules'

let BookmarkMenu = ({dispatch, bookmarks, tracklist, menuState, setMenuState, anchorElRef, current_tlid}) => {

    const saveAsBookmark = (bookmarkName) => {
        const current_track_index = tracklist.findIndex(tlt => tlt.tlid === current_tlid)

        dispatch({
            type: 'LIBRARY_SET_CHILDREN',
            target: ["bookmark:"],
            fun: (bookmarks) => {
                if (bookmarks.find(bk => bk.name === bookmarkName)) {
                    return bookmarks.map(
                        bookmark => {
                            if (bookmark.name === bookmarkName) {
                                return {...bookmark, current_track_index}
                            } else {return bookmark}
                        }
                    )
                } else {
                    return [...bookmarks, {
                        name: bookmarkName,
                        uri: "bookmark:" + bookmarkName,
                        current_track_index,
                        type: "bookmark"
                    }]
                }
            }
        })

        dispatch({
            type: 'LIBRARY_SET_CHILDREN',
            target: ['bookmark:', 'bookmark:' + bookmarkName],
            fun: () => tracklist.map(tlt => tlt.track)
        })

        dispatch({
            type: "BOOKMARK_SAVE",
        })
    }

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
                  saveAsBookmark(name)
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
                                        saveAsBookmark(item.name,
                                                       tracklist.map(tlt => tlt.track))
                                        setMenuState(null)
                                    }}
                          >
                            {item.name}
                          </MenuItem>
                  )
          }
        </Popover>)
}

BookmarkMenu = connect(state => ({bookmarks: state.library.bookmarks,
                                  current_tlid: (state.playback_state.tltrack) ? state.playback_state.tltrack.tlid : null
                                 }))(BookmarkMenu)

export { BookmarkMenu}
