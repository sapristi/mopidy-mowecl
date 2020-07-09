import React from 'react'
import { connect, useSelector, useDispatch } from 'react-redux'

import { ReactSortable } from "react-sortablejs";

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Paper from '@material-ui/core/Paper';
import ListItemText from '@material-ui/core/ListItemText';

import ButtonGroup from '@material-ui/core/ButtonGroup';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import {AppContext, duration_to_human, match} from 'utils'
import {Track} from 'components/molecules'
import { isLeaf, rec_expand_file, addToTracklist, toggleNode } from './functions'
import {DefaultButtons, PLsRootButtons, PLButtons} from './buttons'

import Color from 'color'
import styled from '@emotion/styled'

const dropTo = (lib_item, at_position, to_object, mopidy) => {

    if (to_object.id === 'tracklist')
        addToTracklist(lib_item, at_position, mopidy)
}

const getButtons = (node, dispatch) => {

    return match(node)
        .on(node => node.path && node.path.length === 1, () =>
            null)
        .on(node => node.type === "playlist", () =>
            <PLButtons node={node}/>)
        .otherwise(() =>
                   <DefaultButtons node={node}/>)
 }

const MyBar = styled.div`
   width: 6px;
   flex-shrink: 0;
   opacity: 0.5;

   &:hover {
      opacity: 1;
   }
`

const LibLine = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
padding-left: 3px;
box-sizing: border-box;
border: 2px solid rgba(0,0,0,0);
border-radius: 5px;
&:hover {
    border: 2px solid ${props => Color(props.color).alpha(0.5).string()};
}`



const ChildrenSideBar = ({callback, color}) => (
    <MyBar onClick={callback}>
      <div style={{
          width: 0,
          height: 0,
          borderBottom: '6px solid ' + color,
          borderLeft: '6px solid transparent'
      }}/>
      <div
        style={{
            backgroundColor: color,
            height: 'calc(100% - 16px)',
        }}
      />
      <div
        style={{
            width: 0,
            height: 0,
            borderTop: '6px solid ' + color,
            borderLeft: '6px solid transparent'
        }}
      />
    </MyBar>
)



const NodeLeaves = ({node, depth, rootElem}) => {

    // console.log("Rendering node", node.uri)
    const dispatch = useDispatch()
    const mopidy = useSelector(state => state.mopidy.client)
    const colors = useSelector(state => state.settings.persistant.colors)
    // if (isLeaf(node)) console.log(node)

    if (!node) return null

    const getChildrenNb = (node) => {
        if (isLeaf(node)) return ''
        if (Array.isArray(node.children)) return `(${node.children.length})`
        return '(?)'
    }
    const getText = (node) => {
        if (isLeaf(node)) {
            if (node.length) return <Track text={node.name}
                                           duration={duration_to_human(node.length)}/>
            else return node.name
        } else {
            return `${node.name} ${getChildrenNb(node)}`
        }
    }

    const getIcon = (node) => {
        if (!isLeaf(node)) {
            if (node.expanded) {
                return <ExpandLessIcon style={{verticalAlign: 'text-bottom'}}/>
            } else {return <ExpandMoreIcon style={{verticalAlign: 'text-bottom'}}/>}
        } else return ''
    }



    const ChildrenPanel = ({node, mopidy}) => (
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
          <LibLine color={colors.primary}>
            <ListItemText onClick={() => toggleNode(node, dispatch, mopidy)}>
              <Typography style={rootElem ? {fontWeight: 500 }: {}}>
                {getText(node)}
                {getIcon(node)}
              </Typography>
            </ListItemText>
            {getButtons(node, dispatch)}
          </LibLine>
          <div>
            {  node.expanded && node.children &&

               <div style={{display: 'flex', flexDirection: 'row'}}>
                 <ChildrenSideBar callback={() => toggleNode(node, dispatch, mopidy)}
                                  color={colors.primary}/>
                 <ChildrenPanel node={node} mopidy={mopidy}/>
               </div>

            }
          </div>
        </li>
    )
}

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
        <Paper style={{minHeight: "100%"}}>
          <List style={{paddingLeft: '10px'}}>
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
    )
}

