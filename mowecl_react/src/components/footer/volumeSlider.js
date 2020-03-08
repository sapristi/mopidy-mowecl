
import React from 'react'

import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown'
import VolumeUp from '@material-ui/icons/VolumeUp'

import Button from '@material-ui/core/Button'

import {AppContext} from '../../utils'

const VolumeSlider = ({volume, dispatch, style}) => {

    const { mopidy } = React.useContext(AppContext)
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

    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', ...style}}>
          <div

            onClick={()  => mopidy.mixer.setVolume({volume: (volume -1)})}
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

            onClick={() => mopidy.mixer.setVolume({volume: (volume +1)})}
          ><VolumeUp

               /></div>
        </div>

    )
}

export default VolumeSlider
