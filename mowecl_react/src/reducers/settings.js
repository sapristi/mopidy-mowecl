import React from 'react'

import Typography from '@material-ui/core/Typography'
import Color from 'color'
import {match, ObjectComp} from 'utils'


const validate_hex_color = (str) => {
    if ((!str) || str.length !== 7) return false
    try {
        return Color(str).hex()
    } catch (err) {
        return false
    }
}

const parseBoolean = (v) => {
    let res = null
    if (typeof(v) === "boolean") {res = v}
    if (typeof(v) === "string") {v = v.toLowerCase()}
    if (v === "true" || v === "false") {res = (v === "true")}
    return res
}

const nonNull = (values) => {
    let res = null
    for (let v of values) {
        res = v
        if (v !== null && v !== undefined && ! isNaN(v)) {break}
    }
    return res
}

const staticSettings =
      (window.static_settings_enabled === "true")
      ? ({
          ...window.static_settings,
          mopidy_host: window.location.hostname,
          mopidy_port: 6680,
          generic: {
              ...window.static_settings.generic,
              disable_dnd: parseBoolean(window.static_settings.generic.disable_dnd),
              small_screen: parseBoolean(window.static_settings.generic.small_screen),
          }
      })
// default settings when the app is not served by mopidy
      : ({
          mopidy_host: window.location.hostname,
          mopidy_port: 6680,
          generic: {
              seek_update_interval: 500,
              search_history_length: 10,
              disable_dnd: false,
              small_screen: false,
          },
          colors: {
              themeType: "light",
              background: "#fdf6e3",
              text: "#002b36",
              primary: "#268bd2"
          },
          globalKeys: {
              play_pause: "",
              next: "",
              previous: "",
          }
      })


export const settingsSchema = {
    name: "Settings",
    type: "group",
    description: "Commit after making your changes. In case of incorrect setting, the default value will be used instead of your input",
    mopidy_host: {
        type: "param",
        name: 'Modidy host',
        help: 'Modidy host. Do not modify unless you know what you are doing.',
        validate: v => v || staticSettings.mopidy_host
    },
    mopidy_port: {
        type: "param",
        name: 'Modidy port',
        help: 'Modidy port. Do not modify unless you know what you are doing.',
        validate: v => parseInt(v) || staticSettings.mopidy_port
    },
    generic: {
        name: "Generic",
        type: "group",
        seek_update_interval: {
            type: "param",
            name: "Progress update interval",
            help: 'Time interval (ms) at which the song progress bar will update.',
            validate: v => parseInt(v) || staticSettings.generic.seek_update_interval
        },
        search_history_length: {
            type: "param",
            name: "Search history length",
            help: 'Number of items in search history. Set 0 to disable.',
            validate: v => nonNull([parseInt(v),
                                    staticSettings.generic.search_history_length])
        },
        disable_dnd: {
            type: "param",
            inputType: "select",
            choices: ["true", "false"],
            name: "Disable Drag'n Drop",
            help: "Usefull for touch screens.",
            validate: v => nonNull([parseBoolean(v), staticSettings.generic.disable_dnd])
        },
        small_screen: {
            type: "param",
            inputType: "select",
            choices: ["true", "false"],
            name: "Small screen",
            help: "Enable small screen layout.",
            validate: v => nonNull([parseBoolean(v), staticSettings.generic.small_screen])
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
            help: "Theme type: light or dark. Mostly changes buttons outline color.",
            validate: v => v || staticSettings.colors.themeType,
        },
        background: {
            type: "param",
            name: "Background",
            help: 'Background color, hex representation.',
            validate: v => validate_hex_color(v) ? v : staticSettings.colors.background
        },
        text: {
            type: "param",
            name: "Text",
            help: 'Text color, hex representation.',
            validate: v => validate_hex_color(v) ? v : staticSettings.colors.text
        },
        primary: {
            type: "param",
            name: "Primary",
            help: 'Primary color, hex representation.',
            validate: v => validate_hex_color(v) ? v : staticSettings.colors.primary
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
            validate: v => v || staticSettings.globalKeys.play_pause
        },
        next: {
            type:"param",
            inputType: "shortkey",
            name: "Next track",
            validate: v => v || staticSettings.globalKeys.next,
        },
        previous: {
            type:"param",
            inputType: "shortkey",
            name: "Previous track",
            validate: v => v || staticSettings.globalKeys.previous
        },
        rewind: {
            type:"param",
            inputType: "shortkey",
            name: "Rewind track",
            validate: v => v || staticSettings.globalKeys.rewind,
        },
        volume_up: {
            type: "param",
            inputType: "shortkey",
            name: "Volume up shorcut",
            validate: v => v || staticSettings.globalKeys.volume_up,
        },
        volume_down: {
            type: "param",
            inputType: "shortkey",
            name: "Volume down shorcut",
            validate: v => v || staticSettings.globalKeys.volume_down,
        }
    },
}



const load_rec = (schema, settings) =>
      ObjectComp(
          schema,
          ([k, v]) =>
              match(schema[k].type)
              .on("group", () =>
                  ([k,
                    {
                        ...load_rec(v, settings[k] || {})
                    }
                   ])
                 )
              .on("param", () =>
                  ([k, v.validate(settings[k])])
                 )
              .otherwise(null),
         x => x
      )

export const load = settings => load_rec(settingsSchema, settings)

const saved_settings = JSON.parse(localStorage.getItem("settings")) || {}
const initialSettings = load(saved_settings)

const defaultSettings = {
    active_panel: 'library',
    persistant: initialSettings,
    uri_schemes: [],
}

export const settingsReducer = (state=defaultSettings, action) => (
    match(action.type)
        .on("ACTIVE_PANEL", () =>
            ({...state, active_panel: action.target})
           )
        .on('CLEAR_SETTINGS', () => {
            localStorage.removeItem("settings")
            return {
                ...state,
                persistant: staticSettings
            }
        })
        .on('COMMIT_SETTINGS', () => {
            const newSettings = load(action.data)
            console.log("Commit ", newSettings)
            localStorage.setItem(
                "settings",
                JSON.stringify(newSettings)
            )
            // console.log("Set", state.persistant)
            return {...state, persistant: newSettings }
        })
        .on('SET_THEME', () =>
            ({...state, theme: action.data})
           )
        .on('URI_SCHEMES', () =>
            ({...state, uri_schemes: action.data})
        )
        .otherwise(() => state)
)
