import {memo, useEffect, useRef, useCallback, createContext, useState} from 'react';
import MenuItem from '@mui/material/MenuItem'

import Popover from '@mui/material/Popover'
import AddIcon from '@mui/icons-material/Add'

import {Input} from '@/components/molecules'

export const AddUriMenu = ({anchorElRef, menuState, setMenuState, mopidy}) => {
    return (<Popover
          anchorEl={anchorElRef.current}
          keepMounted
          open={menuState}
          onClose={ () => setMenuState(false)}
          onKeyPress={()=>{}}
        >
          <MenuItem>
            <Input
              label={"URI"}
              icon={<AddIcon/>}
              action={ (uri) => {
                  mopidy.tracklist.add({uris: [uri]})
                  setMenuState(false) } }
            />
          </MenuItem>
        </Popover>)

}
