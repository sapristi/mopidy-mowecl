
import { getDefaultWS } from '../utils'

const saved_settings = JSON.parse(localStorage.getItem("settings")) || {}

const defaultPersistantSettings = {
    mopidy_ws: {
        name: 'Modidy WebSocker URL',
        default: getDefaultWS(),
        help: 'Modidy WebSocker URL. Do not modify unless you know what you are doing.',
        validate: v => v
    },
    seek_update_interval: {
        name: "Seek update interval",
        default: 500,
        help: 'Time interval (ms) at which the song progress bar will update.',
        validate: v => parseInt(v) || 500
    },
    search_history_length: {
        name: "Search history length",
        default: 10,
        help: 'Number of items in search history. Set 0 to disable.',
        validate: v => parseInt(v) || 10
    }
}

const persistantSettings = Object.fromEntries(
    Object.entries(defaultPersistantSettings).map(
        ([k, v]) => {
            const current = saved_settings[k] || v.default
            return [k, {...v, current}]
        }))


const defaultSettings = {
    active_panel: 'library',
    persistant: persistantSettings,
}

export const settingsReducer = (state=defaultSettings, action) => {
    switch (action.type) {
    case 'ACTIVATE_PANEL':
        return {...state, active_panel: action.target}

    case 'CLEAR_SETTINGS':
        localStorage.removeItem("settings")
        return {
            ...state,
            persistant:
            Object.fromEntries(
                Object.entries(defaultPersistantSettings).map(
                    ([k, v]) => {
                        const current = v.default
                        return [k, {...v, current}]
                    }))

        }


    case 'COMMIT_SETTINGS':
        localStorage.setItem("settings",
                             JSON.stringify(
                                 Object.fromEntries(
                                     Object.entries(action.data).map(
                                         ([k,v]) => [k, v.validate(v.current)]
                                     ))))
        // console.log("Set", state.persistant)
        return {...state, persistant:

                Object.fromEntries(
                    Object.entries(action.data).map(
                        ([k, v]) => [k, {...v, current: v.validate(v.current)}]
                    )
                )
                }

    default:
        return state
    }
}
