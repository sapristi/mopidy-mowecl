import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { connect } from "react-redux";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import ExploreIcon from "@mui/icons-material/Explore";

import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import { mdiFileTreeOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { SidePanelUpper } from "./upper";
import { useAppState } from "@/hooks";

const SidePanel = ({ uri_schemes, search_history_length, small_screen }) => {
  const [availableVersion, setAvailableVersion] = useState(() => null);

  if (!availableVersion) {
    fetch("https://pypi.org/pypi/Mopidy-Mowecl/json").then((response) =>
      response.json().then((data) => setAvailableVersion(data.info.version)),
    );
  }

  const setActivePanel = useAppState((state) => state.setActivePanel);
  const currentPanel = useAppState((state) => state.activePanelName);
  const hasExplore = useAppState((state) => Boolean(state.explore));
  const getButtonColor = useCallback(
    (panelName) => (panelName === currentPanel ? "primary" : "default"),
    [currentPanel],
  );

  return (
    <Paper
      elevation={5}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: "10",
      }}
    >
      <SidePanelUpper />
      <ButtonGroup orientation="vertical">
        {small_screen && (
          <Tooltip title="Tracklist panel" followCursor>
            <Button
              onClick={() => setActivePanel("tracklist")}
              color={getButtonColor("tracklist")}
            >
              <QueueMusicIcon />
            </Button>
          </Tooltip>
        )}

        <Tooltip title="Library panel" followCursor>
          <Button
            onClick={() => setActivePanel("library")}
            color={getButtonColor("library")}
          >
            <Icon path={mdiFileTreeOutline} size={1} />
          </Button>
        </Tooltip>
        <Tooltip title="Explore panel" followCursor>
          <Button
            onClick={() => setActivePanel("explore")}
            color={getButtonColor("explore")}
            disabled={!hasExplore}
          >
            <ExploreIcon />
          </Button>
        </Tooltip>

        <Tooltip title="Settings panel" followCursor>
          <Button
            style={{ height: "auto" }}
            color={getButtonColor("control")}
            onClick={() => setActivePanel("control")}
          >
            <SettingsIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        {window.mowecl_version !== availableVersion && availableVersion && (
          <Tooltip
            title={`Version ${availableVersion} available on Pypi.`}
            followCursor
          >
            <Button
              href={
                "https://github.com/sapristi/mopidy-mowecl/tree/master#v" +
                availableVersion.replace(/\./g, "")
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <ErrorOutlineIcon />
            </Button>
          </Tooltip>
        )}
        <Button
          onClick={() => setActivePanel("help")}
          color={getButtonColor("help")}
        >
          <HelpOutlineIcon />
        </Button>
      </ButtonGroup>
    </Paper>
  );
};

export default connect((state) => ({
  search_history_length:
    state.settings.persistant.generic.search_history_length,
  uri_schemes: state.settings.uri_schemes,
  small_screen: state.settings.persistant.generic.small_screen,
}))(SidePanel);
