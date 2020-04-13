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


import {AppContext} from '../utils'

const SettingInput = ({setting, setSetting}) => (
    <>
      <TextField
        label={setting.name}
        variant='outlined'
        style={{margin: 8}}
        value={setting.current}
        fullWidth
        onChange={(event) => {
            setSetting({
                ...setting,
                current: event.target.value
            })}}
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
    </>
)

const SettingsGroup = ({group, path, setInGroup}) => {
    // console.log("Settings group", group)
    return (
        <Paper elevation={path.length}>
          <Typography>{group.name}</Typography>
          <List>
            {
                Object.entries(group).map(
                    ([key, value]) =>
                        <ListItem key={key}>
                          {
                              (value.type === "group") ?
                                  <SettingsGroup group={value} path={[...path, key]}
                                                 setInGroup={
                                                     (gkey, gvalue) => {
                                                         setInGroup(key,
                                                                    {
                                                                        ...value,
                                                                        [gkey]: gvalue
                                                                    })
                                                     }
                                                 }
                                  />
                              :
                              (value.type === "param") ?
                              <SettingInput setting={value}
                                            setSetting={(newValue) => setInGroup(key, newValue)}/>
                              :
                              null
                          }
                        </ListItem>
                )
            }
          </List>
        </Paper>
    )

}


const SettingsPanel = ({persistant, dispatch}) => {
    const { mopidy } = React.useContext(AppContext)
    const [settings, setSettings ] = useState(persistant)

    return (
        <div>
          <SettingsGroup group={settings}
                         setInGroup={(key, value) =>
                                     setSettings(() => ({...settings, [key]: value}))}
                         path={[]}/>

          <ButtonGroup>
          <Button onClick={() => {
              dispatch({
                  type: 'COMMIT_SETTINGS',
                  data: {
                      ...settings
                  }
              })
              if (settings.mopidy_ws.current !== mopidy._settings.webSocketUrl)
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
