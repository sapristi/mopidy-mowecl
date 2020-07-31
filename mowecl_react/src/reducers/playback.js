import {match} from 'utils'

const default_playback = {
    tltrack: {
        track: null,
        tlid: null
    },
    state: null,
    time_position: null,
    updating: false,
    time_position_updater: {
        pending: false,
        last_update: null
    },
    volume: null,
    tracklist_state: {
        Repeat: false,
        Single: false,
        Random: false,
    }
}

export const playbackReducer = (state = default_playback, action) => (
    match(action.type)
        .on('CLEAR_PLAYBACK_INFO', () =>
            ({...default_playback, volume: state.volume, tracklist_state: state.tracklist_state})
           )
        .on('PLAYBACK_INFO', () => {
            const res_target = {}
            res_target[action.target] = action.data
            if (action.target === 'tltrack' && !action.data){
                // console.log("Setting ", action.data, "to tltrack")
                res_target[action.target] = {track: null, tlid: null}}
            const res = Object.assign({}, state, res_target)

            if (action.target === 'time_position') {
                res.time_position_updater.last_update = (new Date()).valueOf()
            }
            return res
        })
        .on('INCR_PLAYBACK_START', () =>
            ({
                ...state,
                time_position_updater: {
                    ...state.time_position_updater,
                    pending: true
                }
            })
           )
        .on('INCR_PLAYBACK', () => {
            const now = (new Date()).valueOf()
            const elapsed = now - state.time_position_updater.last_update
            if (state.state !== 'playing') return state
            return { ...state,
                     time_position: state.time_position + elapsed,
                     time_position_updater: {
                         pending: false,
                         last_update: now
                     }
                   }
        })
        .on('INCR_PLAYBACK_RESET', () =>
            ({ ...state,
               time_position_updater: {
                   pending: false,
                   last_update: null
               }
             })
           )
        .on('PLAYBACK_UPDATING', () =>
            ({ ...state, updating: action.data})
           )
        .on('SET_TRACKLIST_STATE', () =>
            ({...state, tracklist_state: action.data})
           )
        .otherwise(() => state)
)


