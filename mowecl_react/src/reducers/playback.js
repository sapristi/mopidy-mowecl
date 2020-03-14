

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
    volume: null
}

export const playbackReducer = (state = default_playback, action) => {
    switch (action.type) {

    case 'CLEAR_PLAYBACK_INFO':
        return {...default_playback, volume: state.volume}
    case 'PLAYBACK_INFO':
        const res_target = {}
        res_target[action.target] = action.data
        if (action.target === 'tltrack' && !action.data){
            // console.log("Setting ", action.data, "to tltrack")
            res_target[action.target] = {track: null, tlid: null}}
        let res = Object.assign({}, state, res_target)

        if (action.target === 'time_position') {
            res.time_position_updater.last_update = (new Date()).valueOf()
        }

        return res
    case 'INCR_PLAYBACK_START':
        const time_position_updater_new = Object.assign(
            {}, state.time_position_updater, {pending: true})
        return Object.assign(
            {}, state, {time_position_updater: time_position_updater_new})
    case 'INCR_PLAYBACK':
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
    case 'INCR_PLAYBACK_RESET':
        return { ...state,
                 time_position_updater: {
                     pending: false,
                     last_update: null
                 }
               }

    case 'PLAYBACK_UPDATING':
        return { ...state, updating: action.data}
    default:
        return state
    }
}


