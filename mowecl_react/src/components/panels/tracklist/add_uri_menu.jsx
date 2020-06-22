import React from 'react';
import { connect } from 'react-redux'
import MenuItem from '@material-ui/core/MenuItem'

import Popover from '@material-ui/core/Popover'
import AddIcon from '@material-ui/icons/Add'

import {Input} from 'components/molecules'

export const AddUriMenu = ({anchorElRef, menuState, setMenuState, mopidy}) => {
    return (<Popover
          anchorEl={anchorElRef.current}
          keepMounted
          open={(menuState === "add_uri")}
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
