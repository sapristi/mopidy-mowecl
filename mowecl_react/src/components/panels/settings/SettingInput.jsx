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


import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'

import Button from '@material-ui/core/Button'

import {HFlex} from 'components/atoms'

import {match} from 'utils'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import { recordKeyCombination } from 'react-hotkeys'
import { getApplicationKeyMap } from 'react-hotkeys'

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



const KeyInputDialog = ({open, onClose, name}) => {
    const nullFunc = () => {}
    const [cancel, setCancel] = React.useState(() => nullFunc)

    React.useEffect( () => {
        if (open) {
            const cancelListening = recordKeyCombination(({id, keys}) => {
                console.log("FOUND", id, keys)
                const keyMap = getApplicationKeyMap()
                console.log(keyMap)

                id = id.replace(/ /g, "space")
                onClose({action: "save", keys: id})
            })

            setCancel( () => cancelListening)
        } else {
            setCancel( () => nullFunc)
        }
    }, [open, onClose])


    return (
        <Dialog open={open} onClose={() => {cancel(); onClose()}}>
          <DialogTitle>Type in your shortcut for {name}</DialogTitle>
          <Button onClick={() => {cancel(); onClose()}}>Cancel</Button>
        </Dialog>
    )
}


const KeySettingInput = ({setting, handleChange}) => {
    const [dialogOpen, setDialogOpen] = React.useState(() => false)


    const onClose = (action) => {
        console.log("Closing with", action)
        if (action)
            handleChange({target: {value: action.keys}})
        setDialogOpen(false)
    }

    return (
        <HFlex>
          <TextField
            label={setting.name}
            variant='outlined'
            style={{margin: "0 8px"}}
            value={setting.current}
            fullWidth
            onChange={handleChange}
          />
          <Button onClick={() => setDialogOpen(true)}>Input keys</Button>
          <KeyInputDialog open={dialogOpen}
                          onClose={onClose}
                          name={setting.name}
          />
        </HFlex>)
}


export const SettingInput = ({setting, setSetting}) => {

    const handleChange = (event) => setSetting({
        ...setting,
        current: event.target.value
    })

    const input = match(setting.inputType)
          .on("select", () =>
              <SelectSettingInput setting={setting} handleChange={handleChange}/>)
          .on("shortkey", () =>
              <KeySettingInput setting={setting} handleChange={handleChange}/>)
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
