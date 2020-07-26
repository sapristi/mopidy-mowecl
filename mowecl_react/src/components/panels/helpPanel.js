
import React from 'react'

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import GitHubIcon from '@material-ui/icons/GitHub';

import {mowecl_version} from 'utils'

const HelpPanel = () => {

    return (
          <Paper style={{
              margin: "20px 20px auto 20px"

          }}>
            <Typography variant="h4" style={{marginBottom: '10px'}}>
              Mowecl {mowecl_version}
            </Typography>
            <Typography>
              Made with ♥ by Mathias Millet.
            </Typography>
            <a href="https://github.com/sapristi/mopidy-mowecl"><GitHubIcon/></a><br/>
            <Typography variant="caption">
              Remarks, suggestions and bug reports are welcome.
            </Typography>
          </Paper>
    )

}

export default HelpPanel
