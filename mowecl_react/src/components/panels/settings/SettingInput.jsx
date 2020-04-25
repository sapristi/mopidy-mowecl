import React from 'react'

import ListItemIcon from '@material-ui/core/ListItemIcon'
import HTMLTooltip from '@material-ui/core/Tooltip'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

import {match} from 'utils'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

const SettingHelp = ({setting}) =>
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

const TextSettingInput = ({setting, handleChange}) =>
      <TextField
        label={setting.name}
        variant='outlined'
        style={{margin: "0 8px"}}
        value={setting.current}
        fullWidth
        onChange={handleChange}
      />

const SelectSettingInput = ({setting, handleChange}) =>
    <FormControl variant="outlined" style={{width: "100%", margin: "0 8px"}}>
      <InputLabel>{setting.name}</InputLabel>
      <Select
        fullWidth
        label={setting.name}
        value={setting.current} onChange={handleChange}>
        {setting.choices.map(choice => <MenuItem value={choice}>{choice}</MenuItem>)}
      </Select></FormControl>


export const SettingInput = ({setting, setSetting}) => {

    const handleChange = (event) => setSetting({
        ...setting,
        current: event.target.value
    })

    const input = match(setting.inputType)
          .on("select", () =>
              <SelectSettingInput setting={setting} handleChange={handleChange}/>)
          .otherwise(() =>
                     <TextSettingInput setting={setting} handleChange={handleChange}/>)
    const help = (setting.help)
          ? <SettingHelp setting={setting}/>
          : null
    return (
        <>
          {input}
          {help}
        </>
    )
}
