import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import { createTheme } from '@mui/material/styles';


export const duration_to_human = (ms, default_value='??') => {
    if (ms === undefined || ms === null) return default_value

    const s_total = Math.ceil(ms / 1000)
    const s = s_total % 60
    const m = ((s_total - s) / 60)
    const s_str = (s < 10 ? '0' + s : '' + s)
    return `${m}:${s_str}`
}

export const obj_reducer = (obj, prop_name) => obj[prop_name]

export const arrayEquals = (array1, array2) => (array1.length === array2.length && array1.every((value, index) => value === array2[index]))


var uriHumanList = {
    'spotify': 'Spotify',
    'spotifytunigo': 'Spotify browse',
    'spotifyweb': 'Spotify browse',
    'local': 'Local media',
    'm3u': 'Local playlists',
    'podcast': 'Podcasts',
    'podcast+itunes': 'iTunes Store: Podcasts',
    'dirble': 'Dirble',
    'tunein': 'TuneIn',
    'soundcloud': 'SoundCloud',
    'gmusic': 'Google Music',
    'internetarchive': 'Internet Archive',
    'somafm': 'Soma FM',
    'youtube': 'YouTube',
    'audioaddict': 'AudioAddict',
    'subsonic': 'Subsonic'
}


const searchBlacklist = [
    'file',
    'http',
    'https',
    'mms',
    'rtmp',
    'rtmps',
    'rtsp',
    'yt'
]

export const getSearchUris = (uris) =>
    uris
    .filter( uri => !searchBlacklist.includes(uri))
    .map( (uri) => [uri, uriHumanList[uri] || uri])


export const getDefaultMopidyHost = () => {
    const host = window.location.hostname
    const port = 6680
    return `${host}:${port}`
}

export const getWsAddress = (host, port, endpoint) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${host}:${port}/${endpoint}/ws`
}

export const getWsProtocol = () => (
    window.location.protocol === 'https:' ? 'wss:' : 'ws:'
)

export const AppContext = createContext(null);

export const listEquals = (l1, l2) => {
    return l1.map((e,i) => [e, l2[i]]).every(([e1,e2]) => e1 === e2)
}

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


const matched = x => ({
  on: () => matched(x),
  otherwise: () => x,
})

const cleverEval = (fn, x) => (
    (typeof(fn) === "function")
        ? fn(x) : fn
)

export const match = (x, cmp = (a,b) => a===b) => ({
    on: (pred, fn) => (
        (typeof(pred) === "function")
            ? (pred(x) ? matched(cleverEval(fn, x)) : match(x, cmp))
            : ((cmp(x, pred)) ? matched(cleverEval(fn, x)) : match(x, cmp))
    ),
    otherwise: fn => cleverEval(fn, x),
})

export const ObjectComp = (object, mapFn, filterFn) => {
    let res = Object.entries(object).map(mapFn)
    if (filterFn) {
        res = res.filter(filterFn)
    }
    return Object.fromEntries(res)
}

export const mowecl_version = "__VERSION__"

export const createCustomTheme = (themeType, text, text_secondary, primary, secondary, background) => {
    let theme = createTheme()
    console.log({main: text})
    console.log(theme.palette.augmentColor({color: {main: text}}))
    let primaryColor = theme.palette.augmentColor({color: {main: text}})
    return createTheme(
        theme,
        {
            props: {
                MuiButtonBase: {
                    disableRipple: false,
                    focusRipple: false,
                },
            },
            palette: {
                mode: themeType,
                background: {
                    paper: background,
                    default: background,
                },
                primary: primaryColor,
                text: {
                    primary: text,
                    secondary: text_secondary,
                },
                info: {
                    main: primary
                }
            },
            overrides: {
                MuiLinearProgress: {
                    colorPrimary: {
                        backgroundColor: background
                    },
                    bar1Indeterminate: {
                        animation: "MuiLinearProgress-keyframes-indeterminate1 6.3s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite"
                    },
                    bar2Indeterminate: {
                        animation: "MuiLinearProgress-keyframes-indeterminate2 6.3s cubic-bezier(0.165, 0.84, 0.44, 1) 4.45s infinite"
                    }
                }
            }
        })
}
