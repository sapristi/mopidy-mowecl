import React from 'react'
import { connect } from 'react-redux'

import { ReactSortable } from "react-sortablejs";

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import ButtonGroup from '@material-ui/core/ButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';

import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay';

import styled from 'styled-components'

import {AppContext} from '../../utils'
import {toggleNode} from './functions'

import { isLeaf, rec_expand_file, addToTracklist } from './functions'
import {DefaultButtons, PLsRootButtons, TLButtons, PLButtons, BMButtons} from './buttons'

const dropTo = (lib_item, at_position, to_object, mopidy) => {

    if (to_object.id === 'tracklist')
        addToTracklist(lib_item, at_position, mopidy)
}

const getButtons = (node, dispatch) => {

    if (node.type === "playlists_root") {
        return <PLsRootButtons/>
    }
    // first level of tree; 
    if (node.path && node.path.length == 1) return null

    if (node.type === "tracklist") {
        return <TLButtons node={node}/>
    }

    if (node.type === "bookmark") {
        return <BMButtons node={node}/>
    }

    if (node.type === "playlist" && node.uri.endsWith('m3u8')) {
        return <PLButtons node={node}/>
    }
    return (
        <DefaultButtons node={node}/>
    )
}

const MyBar = styled.div`
   width: 8px;
   flex-shrink: 0;
   opacity: 0.25;

   &:hover {
      opacity: 0.5;
   }
`


const ChildrenSideBar = ({callback}) => (
    <MyBar onClick={callback}>
      <div style={{
          width: 0,
          height: 0,
          borderBottom: '8px solid rgba(63, 81, 181, 0.5)',
          borderLeft: '8px solid transparent'
      }}/>
      <div
        style={{
            backgroundColor: 'rgba(63, 81, 181, 0.5)',
            height: 'calc(100% - 16px)',
        }}
      />
      <div
        style={{
            width: 0,
            height: 0,
            borderTop: '8px solid rgba(63, 81, 181, 0.5)',
            borderLeft: '8px solid transparent'
        }}
      />
    </MyBar>
)



const NodeLeaves = ({node, dispatch, depth, typography}) => {

    typography = typography || "body1"
    // console.log("node", node.uri)
    const { mopidy } = React.useContext(AppContext)

    if (!node) return null
    const getIcon = (node) => {
        if (!isLeaf(node)) {
            if (node.expanded) {
                return <ExpandLessIcon style={{verticalAlign: 'text-bottom'}}/>
            } else {return <ExpandMoreIcon style={{verticalAlign: 'text-bottom'}}/>}
        } else return ''
    }

    const getChildrenNb = (node) => {
        if (isLeaf(node)) return ''
        if (node.children === undefined) return '(?)'
        return `(${node.children.length})`
    }



    const ChildrenPanel = () => (
        <ReactSortable
          group={{name: 'library', put: false, pull: "clone" }}
          list={node.children}
        /* setList={()=>{console.log("setlist")}} */
          setList={()=>{}}
          tag={List}
          onEnd={(e) => {dropTo(node.children[e.oldIndex], e.newIndex, e.to, mopidy)}}
          style={{width: '100%'}}
        >
          {
              node.children.map(child => (
                  <NodeLeaves key={child.uri} node={child} dispatch={dispatch}
                              depth={depth+1}/>
              ))
          }
        </ReactSortable>
    )

    return (
        <li style={{paddingTop: 0, paddingBottom: 0,
                    display: 'flex', flexDirection: 'column',
                    paddingLeft: '10px', marginLeft: 0, marginRight: 'auto',
                    textAlign: 'left',
                   }}>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <ListItemText onClick={() => toggleNode(node, dispatch, mopidy)}
        /* style={{marginLeft: 0, marginRight: 'auto'}} */
            >
              <Typography variant={typography}>
                {node.name}
                {getChildrenNb(node)}
                {getIcon(node)}
              </Typography>
            </ListItemText>
            {getButtons(node, dispatch)}
          </div>
          <div>
            {  node.expanded && node.children &&

               <div style={{display: 'flex', flexDirection: 'row'}}>
                 <ChildrenSideBar callback={() => toggleNode(node, dispatch, mopidy)}/>
                 <ChildrenPanel/>
               </div>

            }
          </div>
        </li>
    )

}

let LibraryPanel = ({library, dispatch}) => {


    const full_lib = [
        ...library.mopidyLibrary,
        library.playlists,
        library.search_results,
    ]
    if (library.bookmarks.children.length > 0) {
        full_lib.push(library.bookmarks)
    }

    console.log("Library:", library, dispatch)

    return (
        <List style={{paddingLeft: '10px'}}>
          {
              full_lib.map( (node) => 
                            <NodeLeaves node={node} dispatch={dispatch}
                                        depth={0}
                                        key={node.uri}
                                        typography="button"
                            />
                          )
          }
        </List>
    )
}

export default connect( (state) => ({library: state.library,}) )(LibraryPanel)

