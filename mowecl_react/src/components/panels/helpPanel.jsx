import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";

import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import GitHubIcon from "@mui/icons-material/GitHub";

const HelpPanel = () => {
  return (
    <Paper
      style={{
        margin: "20px 20px auto 20px",
      }}
    >
      <Typography variant="h4" style={{ marginBottom: "10px" }}>
        Mowecl {window.mowecl_version}
      </Typography>
      <Typography>Made with ♥ by Mathias Millet.</Typography>
      <a href="https://github.com/sapristi/mopidy-mowecl">
        <GitHubIcon />
      </a>
      <br />
      <Typography variant="caption">
        Remarks, suggestions and bug reports are welcome.
      </Typography>
    </Paper>
  );
};

export default HelpPanel;
