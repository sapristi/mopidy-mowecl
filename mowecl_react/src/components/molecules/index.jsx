import React from 'react';

import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

import {HFlex} from '../atoms'

export const Input = ({label, action, icon}) => {

    const [inputText, setInputText] = React.useState("")
    return <TextField
             label={label}
             value={inputText}
             onChange={event => setInputText(event.target.value)}
             onKeyPress={(event) => {
                 if (event.key !== 'Enter') return
                 action(inputText); setInputText("")
             }}
             autoFocus
             InputProps={{
                 endAdornment:
                 <InputAdornment position="end">
                   <IconButton
                     onClick={() => {action(inputText); setInputText("")}}
                   >
                     {icon}
                   </IconButton>
                 </InputAdornment>
             }}
           />
}

export const Track = ({text, duration}) => (
    <HFlex style={{justifyContent: "space-between"}}>
      <div>{text}</div>
      <div style={{textAlign: "right", paddingRight: '4px'}}>
        {duration}
      </div>
    </HFlex>
)
