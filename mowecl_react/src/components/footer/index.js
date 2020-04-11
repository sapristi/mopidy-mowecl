
import React from 'react';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import PlaybackButtons from './playbackButtons.js'
import PlaybackSlider from './playbackSlider.js'
import VolumeSlider from './volumeSlider.js'

const TrackInfo = ({track}) => {
    if (!track) return '...'

    // console.log("TrackInfo",track);
    const name = (
        (track.name) ?
            <div>{track.name}</div>:
        null
    )
    const album = (
        (track.album) ?
            <div>{track.album.name}</div> :
        null
    )
    const artist = (
        (track.artists) ?
            <div>{track.artists[0].name}</div> :
        null
    )
    if (track.album) {}
    return (
        <div style={{display: 'flex',  flexDirection:"column"}}>
          {name}
          {album}
          {artist}
        </div>)
}


let Footer = ({tltrack, state,
               volume, dispatch}) =>
    {
        return (
            <Paper
              elevation={3}
              style={{width: '80%', margin: 'auto',
                      display: 'flex', flexDirection: 'row',
                      padding: '5px'
                     }}
            >
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <PlaybackButtons state={state} />
                <VolumeSlider volume={volume} dispatch={dispatch} 
                              style={{marginTop: 'auto', marginBottom: 'auto'}}/>
              </div>
              <div style={{display: 'flex', flexDirection: 'column',
                           flex: 1,
                           paddingLeft: '5%', paddingRight: '5%'}}>
                {
                    (state !== "stopped") && (
                        <>
                          <TrackInfo track={tltrack.track}/>
                          <PlaybackSlider
                            track_length={tltrack.track ? tltrack.track.length : null}
                          />
                        </>
                    )
                }
                <div/>
              </div>
            </Paper>
        )
    };


const getPlaybackState = (state) => {
    return {
        tltrack: state.playback_state.tltrack,
        state: state.playback_state.state,
        volume: state.playback_state.volume,
    }};
Footer = connect(getPlaybackState)(Footer);
export default Footer;
