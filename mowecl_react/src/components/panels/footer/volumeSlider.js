import React from 'react'

import {  useDispatch, connect } from 'react-redux'
import Slider from '@material-ui/core/Slider'
import IconButton from '@material-ui/core/IconButton'
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeUp from '@material-ui/icons/VolumeUp'

export const VolumeSlider = connect(
    state => ({
        mopidyCli: state.mopidy.client,
        volume: state.playback_state.volume})
)(
    React.memo(
        ({mopidyCli, volume}) => {
        const dispatch = useDispatch()
        const handleChange = React.useCallback(
            (event, newValue) => {
                dispatch({
                    type: 'PLAYBACK_INFO',
                    target: 'volume',
                    data: newValue
                })
            },
            [dispatch]
        )

        const handleChangeCommitted = React.useCallback(
            (event, newValue) => {
                mopidyCli.mixer.setVolume({volume: newValue})
            },
            [mopidyCli]
        )

        const volume_incr = React.useCallback(
            () => Math.min(100, Math.floor(volume * 1.1 + 1)),
            [volume])
        const volume_decr = React.useCallback(
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
