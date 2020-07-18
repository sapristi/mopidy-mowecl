import React from 'react'

import { useSelector } from 'react-redux'
import Slider from '@material-ui/core/Slider'
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeUp from '@material-ui/icons/VolumeUp'

export const VolumeSlider = ({volume, dispatch, style}) => {

    const mopidy = useSelector(state => state.mopidy.client)
    const handleChange = (event, newValue) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'volume',
            data: newValue
        })
    }

    const handleChangeCommitted = (event, newValue) => {
        mopidy.mixer.setVolume({volume: newValue})
    }

    const volume_incr = () => Math.min(100, Math.floor(volume * 1.1 + 1))
    const volume_decr = () => Math.floor(volume * 0.9)

    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...style}}>
          <div

            onClick={()  => mopidy.mixer.setVolume({volume: (volume_decr())})}
          ><VolumeDown
            /></div>
          <div style={{ flex: 1, marginLeft: '5%', marginRight: '5%'}}>
            <Slider value={volume}
                    onChange={handleChange}
                    onChangeCommitted={handleChangeCommitted}
                    valueLabelDisplay='auto'
            />
          </div>
          <div

            onClick={() => mopidy.mixer.setVolume({volume: (volume_incr())})}
          ><VolumeUp

               /></div>
        </div>

    )
}
