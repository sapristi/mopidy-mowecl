import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import { create } from 'zustand'

export function useTraceUpdate(props) {
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}



export const useMenuAnchor = () => {
    const [anchorEl, setanchorEl] = useState(null);

    const toggleMenu = (event) => {
        const target = event.target
        setanchorEl(anchorEl ? null : target);
    };
    const closeMenu = () => {
        setanchorEl(null);
    };

    const open = Boolean(anchorEl);
    return { toggleMenu, menuProps: { onClose: closeMenu, anchorEl, open} }
}


export const useAppState = create((set) => ({
    activePanelName: "library",
    setState: set,
    setActivePanel: (value) => set({activePanelName: value})
}))

