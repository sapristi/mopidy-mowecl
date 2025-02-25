import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react'
import { create } from 'zustand'

import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'

import {HFlex} from '@/components/atoms'

const defaultState = {
    text: null,
    callback: () => {}
}

export const useConfirmDialogStore = create((set) => ({
    ...defaultState,
    setState: set,
    reset: () => set(defaultState),
}))


export const ConfirmDialog = () => {
    const state = useConfirmDialogStore()
    const callback = () => {state.callback(); state.reset()}
    const acceptEnter = (event) => {
        const key = event.key
        if (key === "Enter") {
            callback()
        }
    }
    return (
        <Modal open={Boolean(state.text)}
               onClose={state.reset}
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
                  onClick={state.reset}
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
