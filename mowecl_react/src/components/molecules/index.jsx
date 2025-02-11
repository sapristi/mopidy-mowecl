import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import {HFlex} from '../atoms'

export const Input = ({label, action, icon}) => {

    const [inputText, setInputText] = useState("")
    return (
      <TextField
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
                     <IconButton onClick={() => {action(inputText); setInputText("")}} size="large">
                       {icon}
                     </IconButton>
                   </InputAdornment>
               }}
             />
    );
}

export const Track = ({text, duration}) => (
    <HFlex style={{justifyContent: "space-between"}}>
      <div>{text}</div>
      <div style={{textAlign: "right", paddingRight: '4px'}}>
        {duration}
      </div>
    </HFlex>
)
