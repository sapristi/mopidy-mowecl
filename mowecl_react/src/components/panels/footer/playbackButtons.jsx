import {memo, useEffect, useRef, useCallback, createContext, useState, useMemo} from 'react'
import { useSelector } from 'react-redux'

import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'

import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'

import RepeatIcon from '@mui/icons-material/Repeat'
import RepeatOneIcon from '@mui/icons-material/RepeatOne'
import ShuffleIcon from '@mui/icons-material/Shuffle'

const PreviousButton = memo(
    ({size, mopidyCli}) =>
    <Button onClick={() => mopidyCli.playback.previous()} variant="text">
          <SkipPreviousIcon fontSize={size}/>
        </Button>
)

const NextButton = memo(
    ({size, mopidyCli}) =>
        <Button onClick={() => mopidyCli.playback.next()} variant="text">
          <SkipNextIcon fontSize={size}/>
        </Button>
)

const PlayPauseButton = memo(
    ({size, mopidyCli, playbackState}) =>
        (playbackState === 'playing')
        ? (<Button onClick={() => mopidyCli.playback.pause()} variant="text">
             <PauseIcon fontSize={size}/>
           </Button>)
        : <Button onClick={() => mopidyCli.playback.play()} variant="text">
            <PlayArrowIcon fontSize={size}/>
          </Button>
)


export const PlaybackButtons = memo(({playbackState}) => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const small_screen = useSelector(state => state.settings.persistant.generic.small_screen)

    const groupSize = useMemo(
        () => (small_screen) ? "small" : "large",
        [small_screen])
    const size = useMemo(
        () => (small_screen) ? "default" : "large",
        [small_screen])
    return (
        <ButtonGroup size={groupSize}>
          <PreviousButton size={size} mopidyCli={mopidyCli}/>
          <PlayPauseButton size={size} playbackState={playbackState} mopidyCli={mopidyCli}/>
          <NextButton size={size} mopidyCli={mopidyCli}/>
        </ButtonGroup>
    )
})

export const TracklistStateButtons = memo(() => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const tracklistState = useSelector(state => state.playback_state.tracklist_state)
    const makeAction = useCallback(
        (name, state) => () => mopidyCli.tracklist[`set${name}`]({value: !state}),
        [mopidyCli]
    )
    const iconMap = {
        Repeat: <RepeatIcon/>,
        Single: <RepeatOneIcon/>,
        Random: <ShuffleIcon/>,
    }
    return (
        <ButtonGroup orientation="vertical" size="small">
          {
              Object.entries(tracklistState).map(
                  ([name, value]) => (
                      <Button onClick={makeAction(name, value)}
                              color={(value) ? "primary": "default"}
                              key={name}>
                        {iconMap[name]}
                      </Button>
              ))
          }
        </ButtonGroup>
    )
})
