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

export const PlaybackButtons = ({playbackState}) => {
    const mopidy = useSelector(state => state.mopidy.client)
    const small_screen = useSelector(state => state.settings.persistant.generic.small_screen)

    const groupSize = (small_screen) ? "small" : "large"
    const size = (small_screen) ? "default" : "large"
    return (
        <ButtonGroup size={groupSize}>
          <Button onClick={() => mopidy.playback.previous()}>
            <SkipPreviousIcon fontSize={size}/>
          </Button>
          {
              (playbackState === 'playing') ?
                  <Button onClick={() => mopidy.playback.pause()}>
                    <PauseIcon fontSize={size}/>
                  </Button> :
              <Button onClick={() => mopidy.playback.play()}>
                <PlayArrowIcon fontSize={size}/>
              </Button>
          }
          <Button onClick={() => mopidy.playback.next()}>
            <SkipNextIcon fontSize={size}/>
          </Button>
        </ButtonGroup>
    )
}

export const TracklistStateButtons = () => {
    const mopidyCli = useSelector(state => state.mopidy.client)
    const tracklistState = useSelector(state => state.playback_state.tracklist_state)
    const makeAction = (name, state) => () => mopidyCli.tracklist[`set${name}`]({value: !state})
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
}
