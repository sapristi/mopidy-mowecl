import React from 'react'
import {atom, useRecoilState} from 'recoil'

import Modal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'

import {HFlex} from 'components/atoms'

const defaultState = {text: null, callback: () => {}}
export const confirmDialogStateAtom = atom({
    key: "confirm_dialog",
    default: defaultState
})

export const ConfirmDialog = () => {
    const [state, setState] = useRecoilState(confirmDialogStateAtom)
    const callback = () => {state.callback(); setState(defaultState)}
    const acceptEnter = (event) => {
        const key = event.key
        if (key === "Enter") {
            callback()
        }
    }
    return (
        <Modal open={Boolean(state.text)}
               onClose={() => setState(defaultState)}
               onKeyPress={acceptEnter}
        >
          <Paper style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
          }}>
            <div style={{margin: "0px 20px", marginTop: "10px"}}>
              {state.text}
              <HFlex style={{marginTop: "10px"}}>
                <Button
                  onClick={callback}
                  variant="outlined"
                  color="primary"
                >OK
                </Button>
                <Button
                  onClick={() => setState(defaultState)}
                  variant="outlined"
                  color="secondary"
                >Cancel
                </Button>
              </HFlex>
            </div>
          </Paper>
        </Modal>
    )
}
