import React from 'react'
import styled from '@emotion/styled'

const MyBar = styled.div`
   width: 6px;
   flex-shrink: 0;
   opacity: 0.5;

   &:hover {
      opacity: 1;
   }
`

export const ChildrenSideBar = ({callback, color}) => (
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
