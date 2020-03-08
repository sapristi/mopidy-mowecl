
import { getDefaultWS } from '../utils'

const persistantSettings = JSON.parse(localStorage.getItem("settings")) || {
    mopidy_ws: getDefaultWS(),
    seek_update_interval: 1000
}
const defaultSettings = {
    active_panel: 'library',
    persistant: persistantSettings,
}

export const settingsReducer = (state=defaultSettings, action) => {
    switch (action.type) {
    case 'ACTIVATE_PANEL':
        return {...state, active_panel: action.target}

    case 'COMMIT_PERSISTANT':
        localStorage.setItem("settings", JSON.stringify(action.data))
        // console.log("Set", state.persistant)
        return {...state, persistant: action.data}

    default:
        return state
    }
}
