import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import {HFlex} from 'components/atoms'

import {SettingInput} from './SettingInput'

import {settingsSchema} from 'reducers/settings'

const SettingsGroup = ({schema, group, path, setInGroup}) => {
    // console.log("Settings group", group)
    const [open, setOpen] = React.useState(() => (path.length === 0))
    const headerComponent = "h" + (path.length + 1)
    const headerVariant = "h" + (path.length + 4)

    const body = (
        <>
          {schema.description && schema.description}
          <List>
            {
                Object.entries(schema)
                    .filter(([key, value]) => (["param", "group"].includes(value.type)))
                    .map(([key, subSchema]) =>
                         <ListItem key={key}>
                           {
                               (subSchema.type === "group")
                                   ? ( <SettingsGroup schema={subSchema}
                                                      group={group[key]}
                                                      path={[...path, key]}
                                                      setInGroup={(gkey, gvalue) => {
                                                          setInGroup(key, {
                                                              ...group[key],
                                                              [gkey]: gvalue
                                                          })}}/>)
                                   : ( <SettingInput
                                         schema={subSchema}
                                         value={group[key]}
                                         setValue={(newValue) =>
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
          {/* eslint-disable-next-line */}
          <a onClick={() => setOpen(prev => !prev)}>
            <HFlex style={{alignItems: "center"}}>
              <Typography variant={headerVariant} component={headerComponent}>
                {schema.name}</Typography>
              {(open) ? <ExpandLessIcon/>: <ExpandMoreIcon/>}
            </HFlex>
          </a>
          {open && body}
        </Paper>
    )
}


export const SettingsPanel = () => {
    const persistant = useSelector(state => state.settings.persistant)
    const dispatch = useDispatch()
    const [settings, setSettings ] = React.useState(persistant)

    const handleCommit = () => {
        dispatch({
            type: 'COMMIT_SETTINGS',
            data: settings
        })
    }

    const handleClear = () => {
        dispatch({
            type: 'CLEAR_SETTINGS'
        })
    }


    return (
        <Paper style={{margin: '5px'}}>
          <SettingsGroup
            schema={settingsSchema}
            group={settings}
            setInGroup={(key, value) =>
                        setSettings(() => ({...settings, [key]: value}))}
            path={[]}/>

          <ButtonGroup>
            <Button onClick={handleCommit}>Commit</Button>
            <Button onClick={handleClear}>Restore defaults</Button>
          </ButtonGroup>

        </Paper>
    )
}

