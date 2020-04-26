import React from 'react'

import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import Color from 'color'
import { getDefaultWs, getDefaultMopidyHost } from '../utils'

const saved_settings = JSON.parse(localStorage.getItem("settings")) || {}

const validate_hex_color = (str) => {
    if (str.length !== 7) return false
    try {
        return Color(str).hex()
    } catch (err) {
        return false
    }
}

const defaultPersistantSettings = {
    name: "Settings",
    type: "group",
    description: "Commit after making your changes. In case of incorrect setting, the default value will be used instead of your input",
    mopidy_ws: {
        type: "param",
        name: 'Modidy WebSocker URL',
        default: getDefaultWs(),
        help: 'Modidy WebSocker URL. Do not modify unless you know what you are doing.',
        validate: v => v
    },
    generic: {
        name: "Generic",
        type: "group",
        seek_update_interval: {
            type: "param",
            name: "Progress update interval",
            default: 500,
            help: 'Time interval (ms) at which the song progress bar will update.',
            validate: v => parseInt(v) || 500
        },
        search_history_length: {
            type: "param",
            name: "Search history length",
            default: 10,
            help: 'Number of items in search history. Set 0 to disable.',
            validate: v => parseInt(v) || 10
        },
    },
    colors: {
        name: "Theme colors",
        type: "group",
        themeType: {
            type: "param",
            inputType: "select",
            choices: ["light", "dark"],
            name: "Theme type",
            default: "light",
            help: "Theme type: light or dark. Mostly changes buttons outline color.",
            validate: v => v,
        },
        background: {
            type: "param",
            name: "Background",
            default: "#FFFFFF",
            help: 'Background color, hex representation.',
            validate: v => validate_hex_color(v) ? v : "#FFFFFF"
        },
        text: {
            type: "param",
            name: "Text",
            default: "#000000",
            help: 'Text color, hex representation.',
            validate: v => validate_hex_color(v) ? v : "#000000"
        },
        primary: {
            type: "param",
            name: "Primary",
            default: "#3F51B5",
            help: 'Primary color, hex representation.',
            validate: v => validate_hex_color(v) ? v : "#3F51B5"
        },
    },
    globalKeys: {
        type: "group",
        name: "Shortcut keys",
        description: (
            <Typography>Leave a field blank to deactivate. Click the "Input keys" button to assign a new shortcut.</Typography>
        ),
        play_pause: {
            type:"param",
            inputType: "shortkey",
            name: "Play/Pause",
            default: "Space",
            validate: v => v
        },
        next: {
            type:"param",
            inputType: "shortkey",
            name: "Next track",
            default: "ArrowRight",
            validate: v => v
        },
        previous: {
            type:"param",
            inputType: "shortkey",
            name: "Previous track",
            default: "",
            validate: v => v
        },
        rewind: {
            type:"param",
            inputType: "shortkey",
            name: "Rewind track",
            default: "ArrowLeft",
            validate: v => v
        },
        volume_up: {
            type: "param",
            inputType: "shortkey",
            name: "Volume up shorcut",
            default: "ArrowUp",
            validate: v => v
        },
        volume_down: {
            type: "param",
            inputType: "shortkey",
            name: "Volume down shorcut",
            default: "ArrowDown",
            validate: v => v
        }
    },
    remoteSync: {
        name: "Remote sync (experimental)",
        type: "group",
        mopidy_host: {
            type: "param",
            name: 'Modidy WebSocker URL',
            default: getDefaultMopidyHost(),
            help: 'Modidy host URL. Do not modify unless you know what you are doing.',
            validate: v => v
        },
        // sync_tracklists: {
        //     type: "param",
        //     inputType: "checkbox",
        //     name: "Sync tracklists",
        //     default: false,
        //     help: "Sync tracklists with mopidy: tracklists will be the same across all machines accessing the same mopidy host",
        //     validate: v => v
        // }
    }
}



export const loadSaved = (default_s, saved_s) => Object.fromEntries(
    Object.entries(default_s).map(
        ([k, v]) => {
            // console.log("Merging", default_s, saved_s)
            if (default_s[k].type === "group") {
                return [k,
                        {
                            ...v,
                            ...loadSaved(v, saved_s[k] || {})
                        }
                       ]
            } else if (default_s[k].type === "param") {
                const merged_v = saved_s[k] || v.default
                return [k,
                        {
                            ...v,
                            current: merged_v
                        }]
            } else {
                return [k, v]
            }
        }
    )
)

const persistantSettings = loadSaved(defaultPersistantSettings, saved_settings)

export const dumpSettings = (settings) => {
    if (settings.type === "group") {
        return Object.fromEntries(Object.entries(settings).map(
            ([k, v]) => ([k, dumpSettings(v)])
        ))
    } else if (settings.type === "param") {
        return settings.validate(settings.current)
    } else return null
}

const validateSettings = (settings) => {
    if (settings.type === "group") {
        return Object.fromEntries(Object.entries(settings).map(
            ([k, v]) => ([k, validateSettings(v)])
        ))
    } else if (settings.type === "param") {
        return {...settings, current: settings.validate(settings.current)}
    } else return settings
}

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
            persistant: loadSaved(defaultPersistantSettings, {})
        }

    case 'COMMIT_SETTINGS':

        const validated = validateSettings(action.data)

        localStorage.setItem("settings",
                             JSON.stringify(
                                 dumpSettings(action.data)))
        // console.log("Set", state.persistant)
        return {...state,
                persistant: validated
                }

    case 'SET_THEME':
        return {...state, theme: action.data}

    default:
        return state
    }
}
