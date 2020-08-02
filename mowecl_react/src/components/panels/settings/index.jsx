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

import {HFlex, VFlex} from 'components/atoms'

import {SettingInput} from './SettingInput'

import {settingsSchema} from 'reducers/settings'

const SettingsGroup = ({schema, group, path, setInGroup}) => {
    // console.log("Settings group", group)
    const [open, setOpen] = React.useState(() => (path.length === 0))
    const headerComponent = "h" + (path.length + 1)
    const headerVariant = "h" + (path.length + 4)

    const Header = () => {
        if (path.length === 0) {
            return  (
                <Typography variant={headerVariant} component={headerComponent}>
                  {schema.name}
                </Typography>)
        } else {
            return (
                /* eslint-disable-next-line */
                <a onClick={() => setOpen(prev => !prev)}>
                  <HFlex style={{alignItems: "center"}}>
                    <Typography variant={headerVariant} component={headerComponent}>
                      {schema.name}</Typography>
                    {(open) ? <ExpandLessIcon/>: <ExpandMoreIcon/>}
                  </HFlex>
                </a>
            )
        }
    }

    const body = (
        <>
          {schema.description && schema.description}
          <List style={{maxHeight: "100%"}}>
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
          <Header/>
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
        <VFlex style={{padding: '5px', height: '100%', alignItems: "center", width: "100%" }}>
          <Paper style={{ overflow: 'auto', scrollbarWidth: 'thin', flex: "1", width: "100%"}}>
            <SettingsGroup
              schema={settingsSchema}
              group={settings}
              setInGroup={(key, value) =>
                          setSettings(() => ({...settings, [key]: value}))}
              path={[]}/>
          </Paper>
          <ButtonGroup style={{padding: "10px"}}>
            <Button onClick={handleCommit}>Commit</Button>
            <Button onClick={handleClear}>Restore defaults</Button>
          </ButtonGroup>
        </VFlex>
    )
}

