import React from 'react'

import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'

import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'

import {AppContext} from '../../utils'


export const PlaybackButtons = ({playbackState}) => {
    const { mopidy } = React.useContext(AppContext)
    return (
        <ButtonGroup>
          <Button onClick={() => mopidy.playback.previous()}>
            <SkipPreviousIcon fontSize="large"/>
          </Button>

          {
              (playbackState === 'playing') ?
                  <Button onClick={() => mopidy.playback.pause()}>
                    <PauseIcon fontSize="large"/>
                  </Button> :
              <Button onClick={() => mopidy.playback.play()}>
                <PlayArrowIcon fontSize="large"/>
              </Button>
          }
          <Button onClick={() => mopidy.playback.next()}>
            <SkipNextIcon fontSize="large"/>
          </Button>
        </ButtonGroup>
    )
}
