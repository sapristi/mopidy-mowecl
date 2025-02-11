
import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'

export const HFlex = ({children, style}) => (
    <div style={{display: "flex", flexDirection: "row",
                 alignItems: "center", ...style}}>
      {children}
    </div>
)

export const VFlex = ({children, style}) => (
    <div style={{...style, display: "flex", flexDirection: "column"}}>
      {children}
    </div>
)
