import React from 'react'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import HTMLTooltip from '@material-ui/core/Tooltip'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'
import Select from '@material-ui/core/Select'
import NativeSelect from '@material-ui/core/NativeSelect'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import IconButton from '@material-ui/core/IconButton'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import {HFlex} from './atoms'

import {match} from './../utils'
import {AppContext} from '../utils'

import {dumpSettings, loadSaved} from '../reducers/settings'

const SettingInput = ({setting, setSetting}) => {

    const handleChange = (event) => setSetting({
        ...setting,
        current: event.target.value
    })

    const input = match(setting.inputType)
          .on("select", () =>
              <FormControl variant="outlined" style={{width: "100%", margin: "0 8px"}}>
                <InputLabel>{setting.name}</InputLabel>
                <Select
                  fullWidth
                  label={setting.name}
                  value={setting.current} onChange={handleChange}>
                  {setting.choices.map(choice => <MenuItem value={choice}>{choice}</MenuItem>)}
                </Select></FormControl>
             )
          .otherwise( () => 
              <TextField
                label={setting.name}
                variant='outlined'
                style={{margin: "0 8px"}}
                value={setting.current}
                fullWidth
                onChange={handleChange}
              />
          )
    const help = (setting.help)
          ?  (<ListItemIcon>
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
             )
          : null
    return (
        <>
          {input}
          {help}
        </>
    )
}

const SettingsGroup = ({group, path, setInGroup}) => {
    // console.log("Settings group", group)
    const [open, setOpen] = React.useState(() => (path.length === 0))
    const headerComponent = "h" + (path.length + 1)
    const headerVariant = "h" + (path.length + 4)

    const body = (
        <>
          {group.description && group.description}
          <List>
            {
                Object.entries(group)
                    .filter(([key, value]) => (["param", "group"].includes(value.type)))
                    .map(([key, value]) =>
                         <ListItem key={key}>
                           {
                               (value.type === "group")
                                   ? ( <SettingsGroup group={value} path={[...path, key]}
                                                      setInGroup={(gkey, gvalue) => {
                                                          setInGroup(key, {
                                                              ...value,
                                                              [gkey]: gvalue
                                                          })}}/>)
                                   : ( <SettingInput
                                         setting={value}
                                         setSetting={(newValue) =>
                                                     setInGroup(key, newValue)}/>)
                           }
                         </ListItem>
                        )
            }
          </List>

        </>
    )

    return (
        <Paper elevation={path.length} style={{width: "100%"}}>
          <a onClick={() => setOpen(prev => !prev)}>
            <HFlex style={{alignItems: "center"}}>
              <Typography variant={headerVariant} component={headerComponent}>
                {group.name}</Typography>
              {(open) ? <ExpandLessIcon/>: <ExpandMoreIcon/>}
            </HFlex>
          </a>
          {open && body}
        </Paper>
    )
}


const SettingsPanel = ({persistant, dispatch}) => {
    const { mopidy } = React.useContext(AppContext)
    const [settings, setSettings ] = React.useState(persistant)


    const handleCommit = () => {
        dispatch({
            type: 'COMMIT_SETTINGS',
            data: settings
        })
        if (settings.mopidy_ws.current !== mopidy._settings.webSocketUrl)
            dispatch({type: 'CONNECT', mopidy_ws: settings.mopidy_ws.current, dispatch})
    }

    const handleClear = () => {
        dispatch({
            type: 'CLEAR_SETTINGS'
        })
        dispatch({
            type: 'CONNECT', mopidy_ws: settings.mopidy_ws.current, dispatch
        })
    }

    const handleRemoteSave = () => {
        const url = new URL("mowecl/api/settings",
                            persistant.remoteSync.mopidy_host.current).href
        fetch(url,
              {
                  method: "POST",
                  body: JSON.stringify(dumpSettings(settings))
              })
    }

    const handleRemoteLoad = () => {
        const url = new URL("mowecl/api/settings",
                            persistant.remoteSync.mopidy_host.current).href
        fetch(url).then(res => (res.json())).then(
            stored_settings =>
                {console.log(stored_settings)
                 const loaded = loadSaved(settings, stored_settings)
                 dispatch({
                     type: "COMMIT_SETTINGS",
                     data: loaded
                 })
                })
    }

    return (
        <div>
          <SettingsGroup group={settings}
                         setInGroup={(key, value) =>
                                     setSettings(() => ({...settings, [key]: value}))}
                         path={[]}/>

          <ButtonGroup>
            <Button onClick={handleCommit}>Commit</Button>
            <Button onClick={handleClear}>Restore defaults</Button>
            <Button onClick={handleRemoteSave}>Save to mopidy host</Button>
            <Button onClick={handleRemoteLoad}>Load from mopidy host</Button>
          </ButtonGroup>
        </div>
    )
}

export default connect(state => ({persistant: state.settings.persistant}))(SettingsPanel)
