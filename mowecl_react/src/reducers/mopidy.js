import { obj_reducer, listEquals } from '../utils'
import Mopidy from "../mopidy-js/mopidy.js"

const fetchPlaybackInfo = async (dispatch, mopidy) => {

    const to_dispatch = [
        {
            fun_path: ['playback', 'getCurrentTlTrack'],
            base: {type: 'PLAYBACK_INFO', target: 'tltrack'}
        },
        {
            fun_path: ['playback', 'getState'],
            base: {type: 'PLAYBACK_INFO', target: 'state'}
        },
        {
            fun_path: ['playback', 'getTimePosition'],
            base: {type: 'PLAYBACK_INFO', target: 'time_position'}
        },
    ]

    await Promise.all(to_dispatch.map( async ({fun_path, base}) => {
        fun_path.reduce((obj, name) => obj[name], mopidy)

        const fun = fun_path.reduce(obj_reducer, mopidy)
        const res = await fun()
        dispatch(
            Object.assign({}, base, {data: res})
        )
    }))

}


const initMopidyEventsDispatcher = (state, mopidy, dispatch) => {
    // console.log("STATE", state)

    mopidy.on("requests:count", (value) => {
        dispatch({
            type: 'MOPIDY_PENDING_REQUESTS_COUNT',
            data: value
        })
    })
    mopidy.on("state:online", async () => {
        dispatch({
            type: 'MOPIDY_CLIENT_CONNECTED',
        })
        mopidy.tracklist.getTlTracks().then(
            async tltracks => {
                dispatch({
                    type: 'TRACKLIST_INITIALISE',
                    data: tltracks
                })
                const playlists = await mopidy.playlists.asList()
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    target: ["playlist:"],
                    fun: () => playlists,
                })

                const bookmarks = JSON.parse(localStorage.getItem("bookmarks"))
                console.log("BOOKMARKS", bookmarks)
                if (bookmarks)
                    dispatch({
                        type: 'LIBRARY_SET_CHILDREN',
                        target: ["bookmark:"],
                        fun: () => bookmarks.children
                    })

                const synced = JSON.parse(localStorage.getItem('synced'))
                if (!synced) return

                const synced_pl = playlists.find(pl => pl.uri === synced.uri)
                if (!synced_pl) return

                const synced_pl_tracks = await mopidy.playlists.getItems({uri: synced_pl.uri})

                if ( listEquals(synced.children,
                               tltracks.map(tlt => tlt.track.uri)) &&
                    listEquals(synced.children,
                               synced_pl_tracks.map(track => track.uri))
                   ) {
                    dispatch({
                        type: "PLAYLIST_SYNC",
                        data: synced
                    })
                }
            }
        )

        mopidy.mixer.getVolume().then(
            (volume) =>
                dispatch({
                    type: 'PLAYBACK_INFO',
                    target: 'volume',
                    data: volume
                })
        )

        mopidy.library.browse({uri: null}).then(
            library =>
                dispatch({
                    type: 'MOPIDY_LIBRARY_INITIALISE',
                    data: library
                }))

        mopidy.getUriSchemes().then(
            schemes => dispatch({
                type: 'URI_SCHEMES',
                data: schemes
            })
        )

        fetchPlaybackInfo(dispatch, mopidy)


    })

    mopidy.on("state:offline", () => dispatch({
        type: 'MOPIDY_CLIENT_DISCONNECTED',
    }))

    mopidy.on("event:trackPlaybackResumed", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'state',
            data: 'playing'
        })
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: data.time_position
        })

    })
    mopidy.on("event:trackPlaybackPaused", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'state',
            data: 'paused'
        })
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: data.time_position
        })
        dispatch({
            type: 'INCR_PLAYBACK_RESET'
        })

    })

    mopidy.on("event:seeked", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: data.time_position
        })

    })

    mopidy.on("event:trackPlaybackStarted", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'track',
            data: data.track
        })
    })

    mopidy.on("event:trackPlaybackEnded", (data) => {
        dispatch({type: "CLEAR_PLAYBACK_INFO"})
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'state',
            data: 'stopped'
        })    })

    mopidy.on("event:trackPlaybackStarted", (data) => {
        dispatch({type: 'INCR_PLAYBACK_RESET'})
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'state',
            data: 'playing'
        })
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: 0
        })
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'tltrack',
            data: data.tl_track
        })

    })

    mopidy.on("event:tracklistChanged", () => {
        mopidy.tracklist.getTlTracks().then(
            (data) =>
                dispatch({
                    type: 'TRACKLIST_INITIALISE',
                    data: data
                }))
        fetchPlaybackInfo(dispatch, mopidy)
    })

    mopidy.on("event:volumeChanged", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'volume',
            data: data.volume
        })
    })
}



export const mopidyReducer = (state={
    connected: false,
    connecting: false,
    uri_schemes: [],
    pendingRequestsNb: 0,
    error: null
}, action) => {
    switch (action.type) {
    case 'MOPIDY_CLIENT_CONNECTED':
        return {...state, connected: true, connecting: false}

    case 'MOPIDY_CLIENT_DISCONNECTED':
        return {...state, connected: false, connecting: true}

    case 'MOPIDY_PENDING_REQUESTS_COUNT':
        return {...state, pendingRequestsNb: action.data}

    case 'CONNECT':

        if (! action.dispatch || ! action.mopidy_ws) {
            const error = "dispatch and mopidy_host must be passed at CONNECT"
            console.log("ERROR: "+ error) 
            return {...state, error, connecting: true}
        }

        const webSocketUrl = action.mopidy_ws + "/mopidy/ws"

        console.log("webSocketUrl:", webSocketUrl)

        if (window.mopidy) {
            window.mopidy.removeAllListeners()
            window.mopidy.close()
            window.mopidy.off()
        }
        const mopidy = new Mopidy({webSocketUrl, autoConnect: false})
        const bookmarks = new Mopidy({
            webSocketUrl: action.mopidy_ws + "/bookmarks/ws"
        })
        window.boomarks = bookmarks
        try {
            mopidy.connect()
        } catch(error) {
            console.log("Error when initializing mopidy", error)
            mopidy.removeAllListeners()
            mopidy.close()
            mopidy.off()
            initMopidyEventsDispatcher(state, mopidy, action.dispatch)
            return {...state, error: error.toString(), connecting: false}
        }

        mopidy.on('event', console.log)
        window.mopidy=mopidy
        // console.log("Connecting to ", webSocketUrl)
        initMopidyEventsDispatcher(state, mopidy, action.dispatch)
        return {...state, connecting: true, connected: false, error: null}

    case 'URI_SCHEMES':
        return {...state, uri_schemes: action.data}

    default:
        return state

    }
}


