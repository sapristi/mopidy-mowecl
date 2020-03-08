
import React from 'react';

import Slider from '@material-ui/core/Slider';
import LinearProgress from '@material-ui/core/LinearProgress';

import { duration_to_human, AppContext } from '../../utils';
const sliderSteps = 300;


const PlaybackSlider = ({time_position, track_length, dispatch}) => {

    const { mopidy } = React.useContext(AppContext)
    // console.log("steps", sliderSteps, time_position, track_length);
    const handleChange = (event, newValue) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: newValue * track_length / sliderSteps
        });
    };

    const handleChangeCommitted = (event, newValue) => {
        mopidy.playback.seek({time_position: Math.ceil(newValue * track_length / sliderSteps)})
    };

    const sliderValue = Math.ceil(time_position / track_length * sliderSteps)

    if (track_length) {
        return (
            <div style={{display: 'flex', flexDirection: 'row',
                         alignItems: 'center'}}>
              <div style={{width: '40px'}}>
                {duration_to_human(time_position)}
              </div>
              <Slider value={sliderValue}
                      onChange={handleChange}
                      onChangeCommitted={handleChangeCommitted}
                      max={sliderSteps}
                      valueLabelDisplay='auto'
                      valueLabelFormat={ (args) => duration_to_human(args * track_length / sliderSteps)}
                      style={{flex: 1, marginRight: '5%', marginLeft: '5%'}}
              />
              <div>
                {duration_to_human(track_length)}
              </div>
            </div>
        )
    } else {
        return (
            <div style={{display: 'flex', flexDirection: 'row',
                         alignItems: 'center' }}>
              <div>
                {duration_to_human(time_position)}
              </div>
              <LinearProgress style={{flex: 1, marginRight: '5%', marginLeft: '5%'}} />
            </div>
        )
    }
};

export default PlaybackSlider
