
import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';

import Paper from '@mui/material/Paper';
import {PlaybackButtons, TracklistStateButtons} from './playbackButtons'
import {PlaybackSlider} from './playbackSlider'
import {VolumeSlider} from './volumeSlider'
import {VFlex} from '@/components/atoms'


const TrackInfo = ({track}) => {

    const mopidy = useSelector(state => state.mopidy.client)
    const dispatch = useDispatch()

    if (!track) return '...'

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

const footerStyle = {width: '80%', margin: 'auto',
                     display: 'flex', flexDirection: 'row',
                     padding: '5px'}

export const Footer = connect(
    state => ({
        tltrack: state.playback_state.tltrack,
        state: state.playback_state.state,
    })
)(
    memo((
        {tltrack, state, volume}
    ) =>
        {
            return (
                <Paper
                  elevation={3}
                  style={footerStyle}>
                  <VFlex>
                    <PlaybackButtons playbackState={state} />
                    <VolumeSlider/>
                  </VFlex>
                  <VFlex style={{flex: 1, paddingLeft: '5%', paddingRight: '5%'}}>
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
                  </VFlex>
                  <TracklistStateButtons/>
                </Paper>
            )
        }))

