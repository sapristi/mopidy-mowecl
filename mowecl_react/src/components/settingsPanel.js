import React, {useState} from 'react'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import HTMLTooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


const SettingsPanel = ({persistant, dispatch}) => {

    const [settings, setSettings ] = useState(persistant)

    return (
        <div>
            <List>
            {
                Object.entries(settings).map(
                    ([key, setting]) =>

                    <ListItem key={setting.name}>
                      <TextField
                        label={setting.name}
                        variant='outlined'
                        style={{margin: 8}}
                        value={setting.current}
                        fullWidth
                        onChange={(event) =>
                                  {
                                      const new_value = event.target.value
                                      setSettings( previous =>
                                                   ({
                                                       ...previous,
                                                       [key]: {
                                                           ...previous[key],
                                                           current: new_value}
                                                   })
                                                 )}
                                 }
                      />
                      <ListItemIcon>
                        <HTMLTooltip
                          title={
                              <Paper style={{padding: '10px', fontSize: 'small'}}>
                                <Typography>
                                  {setting.help}
                                </Typography>
                                <Typography>
                                  Default: <em>{setting.default}</em> 
                                </Typography>
                              </Paper>
                          }
                        >
                          <HelpOutlineIcon/>
                        </HTMLTooltip>
                      </ListItemIcon>
                    </ListItem>
                )
            }
            </List>

          <ButtonGroup>
          <Button onClick={() => {
              dispatch({
                  type: 'COMMIT_SETTINGS',
                  data: {
                      ...settings
                  }
              })
              dispatch({type: 'CONNECT', mopidy_ws: settings.mopidy_ws.current, dispatch})
          }}>
            Commit
          </Button>

            <Button onClick={() => {
                dispatch({
                    type: 'CLEAR_SETTINGS'
                })
                dispatch({
                    type: 'CONNECT', mopidy_ws: settings.mopidy_ws.current, dispatch
                })
            }}
            >
              Restore defaults
            </Button>
          </ButtonGroup>

        </div>
    )


}

export default connect(state => ({persistant: state.settings.persistant}))(SettingsPanel)
