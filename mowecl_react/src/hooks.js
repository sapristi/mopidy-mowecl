import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'

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



export const useMenuAnchor = (id) => {
    const [anchorEl, setanchorEl] = useState(null);

    const handleClick = (event) => {
        const target = event.target
        setanchorEl(anchorEl ? null : target);
    };
    const onClose = () => {
        setanchorEl(null);
    };

    const open = Boolean(anchorEl);
    const menuId = open ? id : undefined;
    return { menuId, handleClick, menuProps: { onClose, anchorEl, open} }
}
