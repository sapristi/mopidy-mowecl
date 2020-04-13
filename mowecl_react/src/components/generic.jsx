
import React from 'react';


import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

const Input = ({label, action, icon}) => {

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


const Track = ({text, duration}) => (
    <div style={{
        display: "flex", flexDirection: "row",
        justifyContent: "space-between", alignItems: "center"}}>
      <div>{text}</div>
    <div style={{textAlign: "right", paddingRight: '4px'}}>
        {duration}
      </div>
    </div>
)

export {Input, Track}
