import React from 'react'
import {useSelector} from 'react-redux'

import List from '@material-ui/core/List'
import Paper from '@material-ui/core/Paper'

import {VFlex} from 'components/atoms'
import {ExtraButtonsPopover} from './buttons'

import {NodeLeaves} from './NodeLeaves'

export const LibraryPanel = () => {

    const library = useSelector(state => state.library)
    const full_lib = [
        ...library.mopidyLibrary,
    ]

    const optionalLibItems = [
        library.playlists,
        library.bookmarks,
        library.search_results,
        library.search_history
    ]

    optionalLibItems.forEach(
        item => {
            if (item.children.length > 0) {
                full_lib.push(item)
            }}
    )

    return (
        <VFlex style={{height: "100%", width: "100%"}}>
          { (library.favorites.children.length > 0) &&
            <Paper elevation={5} variant='outlined'>
              <List style={{paddingLeft: '10px'}}>
                <NodeLeaves node={library.favorites} depth={0}/>
              </List>
            </Paper>
          }
          <Paper style={{height: "100%", overflow: 'auto', scrollbarWidth: 'thin'}}>
            <List style={{paddingLeft: '10px', paddingTop: 0}}>
              {
                  full_lib.map( (node) =>
                                <NodeLeaves node={node}
                                            depth={0}
                                            key={node.uri}
                                            rootElem
                                />
                              )
              }
            </List>
          </Paper>
          <ExtraButtonsPopover/>
        </VFlex>
    )
}

