import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import styled from '@emotion/styled'
import Color from 'color'
import { ReactSortable } from "react-sortablejs"

import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'

import {Track} from 'components/molecules'
import {duration_to_human, match} from 'utils'

import {ChildrenSideBar} from "./ChildrenSideBar"
import {DefaultButtons, PLButtons, BMButtons} from './buttons'
import { isLeaf, addToTracklist, toggleNode } from './functions'


const dropTo = (lib_item, at_position, to_object, mopidy) => {

    if (to_object.id === 'tracklist')
        addToTracklist(lib_item, at_position, mopidy)
}

const getButtons = (node) => {

    return match(node)
        .on(node => node.path && node.path.length === 1, () =>
            null)
        .on(node => node.uri.startsWith("bookmark:"), () =>
            <BMButtons node={node}/>)
        .on(node => node.type === "playlist", () =>
            <PLButtons node={node}/>)
        .otherwise(() =>
                   <DefaultButtons node={node}/>)
}

const getChildrenNb = (node) => {
    if (isLeaf(node)) return ''
    if (Array.isArray(node.children)) return `(${node.children.length})`
    return '(?)'
}

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

const NodeLeavesLi = styled.li`
padding-top: 0,
padding-bottom: 0,
display: flex,
flexDirection: column',
padding-left: 10px,
margin-left: 0,
margin-right: auto,
text-align: left,
`

const ChildrenPanel = ({node, mopidy, depth, dispatch}) => {
    const disableDnd = useSelector(state => state.settings.persistant.generic.disable_dnd)

    return (
        (disableDnd)
            ? (
                <List style={{width: '100%'}}>
                    {
                        node.children.map(child => (
                            <NodeLeaves key={child.uri} node={child} depth={depth+1}/>
                        ))
                    }
                </List>
            )
            : (
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
                            <NodeLeaves key={child.uri} node={child} depth={depth+1}/>
                        ))
                    }
                </ReactSortable>
            )
)}



const NodeText = ({node, rootElem, dispatch, mopidy}) => {

    if (isLeaf(node)) {
         const text = (node.length)
               ? <Track text={node.name} duration={duration_to_human(node.length)}/>
               : node.name
        return (
            <Typography style={{wordBreak: "break-word", textAlign: "left"}}>
              {text}
            </Typography>
        )
    } else {
        const icon = (node.expanded)
              ? (<ExpandLessIcon style={{verticalAlign: 'text-bottom'}}/>)
              : (<ExpandMoreIcon style={{verticalAlign: 'text-bottom'}}/>)

        return (
            <Button onClick={() => toggleNode(node, dispatch, mopidy)}
                    style={{padding: 0, width: "100%", justifyContent:"left",
                            textAlign: "left"}}
                    variant="text"
            >
              <Typography style={rootElem ? {fontWeight: 500}: {wordBreak: "break-word"}}>
                {node.name} {getChildrenNb(node)}
                {icon}
              </Typography>
            </Button>)
    }
}



export const NodeLeaves = React.memo(({node, depth}) => {

    // console.log("Rendering node", node.uri)
    const dispatch = useDispatch()
    const mopidy = useSelector(state => state.mopidy.client)
    const colors = useSelector(state => state.settings.persistant.colors)
    // if (isLeaf(node)) console.log(node)

    if (!node) return null

    return (
        <NodeLeavesLi>
          <LibLine color={colors.primary}>
            <ListItemText>
              <NodeText node={node} rootElem={depth===0} dispatch={dispatch} mopidy={mopidy}/>
            </ListItemText>
            {getButtons(node)}
          </LibLine>
          <div>
            {  node.expanded && node.children &&

               <div style={{display: 'flex', flexDirection: 'row'}}>
                 <ChildrenSideBar callback={() => toggleNode(node, dispatch, mopidy)}
                                  color={colors.primary}/>
                 <ChildrenPanel node={node} mopidy={mopidy} depth={depth} dispatch={dispatch}/>
               </div>

            }
          </div>
        </NodeLeavesLi>
    )
})
