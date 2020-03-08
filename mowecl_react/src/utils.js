import React from 'react'


export const duration_to_human = (ms) => {
    if (ms === undefined || ms === null) {return '??';}

    const s_total = Math.ceil(ms / 1000);
    const s = s_total % 60;
    const m = ((s_total - s) / 60);
    const s_str = (s < 10 ? '0' + s : '' + s);
    return `${m}:${s_str}`;
};

export const obj_reducer = (obj, prop_name) => obj[prop_name];

export const arrayEquals = (array1, array2) => (array1.length === array2.length && array1.every((value, index) => value === array2[index]));


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

export const getDefaultWS = () => {
    const schema = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const host = window.location.hostname
    const port = 6680
    return `${schema}://${host}:${port}/mopidy/ws`
}

export const AppContext = React.createContext(null);

export const listEquals = (l1, l2) => {
    return l1.map((e,i) => [e, l2[i]]).every(([e1,e2]) => e1 === e2)
}

export function useTraceUpdate(props) {
    const prev = React.useRef(props);
    React.useEffect(() => {
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
