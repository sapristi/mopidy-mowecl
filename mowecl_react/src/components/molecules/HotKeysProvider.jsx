import React from 'react'
import { connect } from 'react-redux'

import {AppContext} from '../../utils'


import {configure, GlobalHotKeys} from 'react-hotkeys';

// configure({
//     customKeyCodes: {
//         10009: "play_pause",
//         10009: "previous",
//         10009: "rewind",
//         10009: "volume_up",
//         10009: "volume_down",
//     },

//     logLevel: "debug"
// })


const HotKeysProviderUnc = ({playbackState, volume, hotkeys_conf}) => {
    const { mopidy } = React.useContext(AppContext)

    const [HotKeys, setHotKeys] = React.useState(() => () => null)

    const keyMap = Object.fromEntries(
        Object.entries(hotkeys_conf)
            .filter(([action, setting]) =>
                    (setting.type === "param" && setting.current))
            .map(([action,setting]) => [action, setting.current]))

    const volume_incr = () => Math.min(100, Math.ceil(volume * 1.1))
    const volume_decr = () => Math.max(0, Math.ceil(volume * 0.9))

    React.useEffect( () => {

        const handlers = {
            play_pause: () => {
                ((playbackState === 'playing')
                 ? mopidy.playback.pause()
                 : mopidy.playback.play()
                )},
            next: () => mopidy.playback.next(),
            previous: () => mopidy.playback.previous(),
            rewind: () => mopidy.playback.seek({time_position: 0}),
            volume_up: () => mopidy.mixer.setVolume({volume: volume_incr()}),
            volume_down: () => mopidy.mixer.setVolume({volume: volume_decr()}),
        }


        setHotKeys( () => () => <GlobalHotKeys keyMap={keyMap} handlers={handlers}/>)
    },
                     [playbackState, volume, hotkeys_conf])

    return <HotKeys/>
}

export const HotKeysProvider = connect(
    state => ({
        playbackState: state.playback_state.state,
        volume: state.playback_state.volume,
        hotkeys_conf: state.settings.persistant.globalKeys
    })
)(HotKeysProviderUnc)
