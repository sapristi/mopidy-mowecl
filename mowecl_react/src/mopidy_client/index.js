import { obj_reducer, listEquals } from 'utils'

const fetchPlaybackInfo = async (mopidy, dispatch) => {

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


export const initMopidyEventsDispatcher = (mopidy, dispatch) => {

    mopidy.on('event', console.log)
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

        fetchPlaybackInfo(mopidy, dispatch)


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
        fetchPlaybackInfo(mopidy, dispatch)
    })

    mopidy.on("event:volumeChanged", (data) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'volume',
            data: data.volume
        })
    })
}


