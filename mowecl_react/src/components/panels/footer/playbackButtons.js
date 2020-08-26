import React from 'react'
import { useSelector } from 'react-redux'

import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'

import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

import RepeatIcon from '@material-ui/icons/Repeat'
import RepeatOneIcon from '@material-ui/icons/RepeatOne'
import ShuffleIcon from '@material-ui/icons/Shuffle'

const PreviousButton = React.memo(
    ({size, mopidyCli}) =>
        <Button onClick={() => mopidyCli.playback.previous()}>
          <SkipPreviousIcon fontSize={size}/>
        </Button>
)

const NextButton = React.memo(
    ({size, mopidyCli}) =>
        <Button onClick={() => mopidyCli.playback.next()}>
          <SkipNextIcon fontSize={size}/>
        </Button>
)

const PlayPauseButton = React.memo(
    ({size, mopidyCli, playbackState}) =>
        (playbackState === 'playing')
        ? (<Button onClick={() => mopidyCli.playback.pause()}>
             <PauseIcon fontSize={size}/>
           </Button>)
        : <Button onClick={() => mopidyCli.playback.play()}>
            <PlayArrowIcon fontSize={size}/>
          </Button>
)


export const PlaybackButtons = React.memo(({playbackState}) => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const small_screen = useSelector(state => state.settings.persistant.generic.small_screen)

    const groupSize = React.useMemo(
        () => (small_screen) ? "small" : "large",
        [small_screen])
    const size = React.useMemo(
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

export const TracklistStateButtons = React.memo(() => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const tracklistState = useSelector(state => state.playback_state.tracklist_state)
    const makeAction = React.useCallback(
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
