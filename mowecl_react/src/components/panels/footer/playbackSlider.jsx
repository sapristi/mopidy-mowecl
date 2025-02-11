import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import { connect, useSelector, useDispatch} from 'react-redux'

import Slider from '@mui/material/Slider'
import LinearProgress from '@mui/material/LinearProgress'

import { duration_to_human } from '@/utils'
const sliderSteps = 300


const PlaybackUpdaterUnc = ({state, time_position, time_position_updater, seek_update_interval}) => {
    const dispatch = useDispatch()
    useEffect( () => {
        if (state === 'playing'
            && typeof(time_position) === 'number'
            && !time_position_updater.pending)
        {
            dispatch({type: 'INCR_PLAYBACK_START'})
            setTimeout(() => dispatch({type: 'INCR_PLAYBACK'}), parseInt(seek_update_interval))
        }
    })
    return null
}

const PlaybackUpdater = connect((state) => (
    {...state.playback_state,
     seek_update_interval: state.settings.persistant.generic.seek_update_interval
    }))(
    PlaybackUpdaterUnc)


export const PlaybackSlider = ({track_length}) => {

    const mopidy = useSelector(state => state.mopidy.client)
    const dispatch = useDispatch()
    const time_position = useSelector(state => state.playback_state.time_position)
    // console.log("steps", sliderSteps, time_position, track_length)
    const handleChange = (event, newValue) => {
        dispatch({
            type: 'PLAYBACK_INFO',
            target: 'time_position',
            data: newValue * track_length / sliderSteps
        })
    }

    const handleChangeCommitted = (event, newValue) => {
        mopidy.playback.seek({time_position: Math.ceil(newValue * track_length / sliderSteps)})
    }

    const sliderValue = Math.ceil(time_position / track_length * sliderSteps)

    if (track_length) {
        return (
            <div style={{display: 'flex', flexDirection: 'row',
                         alignItems: 'center'}}>
              <PlaybackUpdater/>
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
                      color="info"
                      size="small"
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
              <PlaybackUpdater/>
              <div>
                {duration_to_human(time_position)}
              </div>
              <LinearProgress style={{flex: 1, marginRight: '5%', marginLeft: '5%'}} />
            </div>
        )
    }
}
