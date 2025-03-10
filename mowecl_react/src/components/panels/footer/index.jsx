import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { connect, useSelector, useDispatch } from "react-redux";

import Paper from "@mui/material/Paper";
import { PlaybackButtons, TracklistStateButtons } from "./playbackButtons";
import { PlaybackSlider } from "./playbackSlider";
import { VolumeSlider } from "./volumeSlider";
import { VFlex } from "@/components/atoms";
import { useMopidyImage } from "@/hooks";
import { Album, Artist } from "@/components/molecules/track";

const TrackInfo = ({ track }) => {
  if (!track) return "...";

  const name = track.name ? <div>{track.name}</div> : null;
  const album = track.album ? <div>{track.album.name}</div> : null;
  const artist = track.artists ? <div>{track.artists[0].name}</div> : null;
  if (track.album) {
  }
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
        }}
      >
        {name}
        <Album album={track.album} />
        <Artist artists={track.artists} />
      </div>
    </div>
  );
};

const TrackImage = () => {
  const tltrack = useSelector((state) => state.playback_state.tltrack);
  const imageUrl = useMopidyImage(tltrack.track?.uri);

  return <img src={imageUrl} style={{ maxHeight: "100px" }} />;
};

const footerStyle = {
  width: "70%",
  margin: "auto",
  display: "flex",
  flexDirection: "row",
  padding: "5px",
  justifyContent: "space-between",
  gap: "5%",
  alignItems: "center",
};

export const Footer = connect((state) => ({
  tltrack: state.playback_state.tltrack,
  state: state.playback_state.state,
}))(({ tltrack, state }) => {
  return (
    <Paper elevation={3} style={footerStyle}>
      <VFlex>
        <PlaybackButtons playbackState={state} />
        <VolumeSlider />
      </VFlex>
      <TrackImage />
      <VFlex style={{ flex: 1 }}>
        {state !== "stopped" && (
          <>
            <TrackInfo track={tltrack.track} />
            <PlaybackSlider
              track_length={tltrack.track ? tltrack.track.length : null}
            />
          </>
        )}
      </VFlex>
      <TracklistStateButtons />
    </Paper>
  );
});
