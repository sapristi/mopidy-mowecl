import React, {useState} from 'react'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const ControlPanel = ({persistant, dispatch}) => {


    const [mopidy_ws, set_mopidy_ws] =
          useState(persistant.mopidy_ws);

    const [seek_update_interval, set_seek_update_interval] =
          useState(persistant.seek_update_interval);

    return (
        <div>
          <form noValidate autoComplete="off">
            <TextField
              label="Mopidy websocket URL"
              variant="outlined"
              style={{margin: 8, width: '80%'}}
              InputLabelProps={{
                  shrink: true,
              }}
              value={mopidy_ws}
              onChange={(event) => set_mopidy_ws(event.target.value)}
            />
             <TextField
              label="Seek update interval"
              variant="outlined"
              style={{margin: 8}}
              InputLabelProps={{
                  shrink: true,
              }}
              value={seek_update_interval}
              onChange={(event) => set_seek_update_interval(event.target.value)}
            />

          </form>

          <Button onClick={() => {
              dispatch({
                  type: 'COMMIT_PERSISTANT',
                  data: {
                      mopidy_ws,
                      seek_update_interval
                  }
              })
              dispatch({type: 'CONNECT', mopidy_ws, dispatch})
          }
                          }>
            Commit</Button>

        </div>
    )


}

export default connect(state => state.settings)(ControlPanel)
