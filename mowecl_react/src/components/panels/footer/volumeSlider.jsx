import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'

import {  useDispatch, connect } from 'react-redux'
import Slider from '@mui/material/Slider'
import IconButton from '@mui/material/IconButton'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeUp from '@mui/icons-material/VolumeUp'

export const VolumeSlider = connect(
    state => ({
        mopidyCli: state.mopidy.client,
        volume: state.playback_state.volume})
)(
    memo(
        ({mopidyCli, volume}) => {
        const dispatch = useDispatch()
        const handleChange = useCallback(
            (event, newValue) => {
                dispatch({
                    type: 'PLAYBACK_INFO',
                    target: 'volume',
                    data: newValue
                })
            },
            [dispatch]
        )

        const handleChangeCommitted = useCallback(
            (event, newValue) => {
                mopidyCli.mixer.setVolume({volume: newValue})
            },
            [mopidyCli]
        )

        const volume_incr = useCallback(
            () => Math.min(100, Math.floor(volume * 1.1 + 1)),
            [volume])
        const volume_decr = useCallback(
            () => Math.floor(volume * 0.9),
            [volume])

        return (
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center',
                         marginTop: 'auto', marginBottom: 'auto'}}>
              <IconButton size="small"
                          onClick={()  => mopidyCli.mixer.setVolume({volume: (volume_decr())})}
              ><VolumeDown/>
              </IconButton>
              <div style={{ flex: 1, marginLeft: '5%', marginRight: '5%'}}>
                <Slider value={volume}
                        onChange={handleChange}
                        onChangeCommitted={handleChangeCommitted}
                        valueLabelDisplay='auto'
                        color="primary"
                        size="small"
                />
              </div>
              <IconButton size="small"
                          onClick={() => mopidyCli.mixer.setVolume({volume: (volume_incr())})}
              >
                <VolumeUp/>
              </IconButton>
            </div>
    )
        }))
