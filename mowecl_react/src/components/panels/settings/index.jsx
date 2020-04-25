import React from 'react'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Switch from '@material-ui/core/Switch'
import NativeSelect from '@material-ui/core/NativeSelect'
import IconButton from '@material-ui/core/IconButton'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import {HFlex} from 'components/atoms'

import {AppContext,match} from 'utils'

import {SettingInput} from './SettingInput'

import {dumpSettings, loadSaved} from 'reducers/settings'

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
