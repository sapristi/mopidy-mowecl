import { HFlex } from "@/components/atoms";
import { GIcon } from "@/components/molecules";
import { useAppState } from "@/hooks";

import { duration_to_human } from "@/utils";
import { Button } from "@mui/material";

const sep = <span style={{ lineHeight: "0px" }}> ⁕ </span>;

export const Artist = ({ artist, addSep }) => {
  const setExplore = useAppState((state) => state.setExplore);
  const artistIcon = <GIcon name="artist" style={{ paddingRight: "3px" }} />;
  const artistName = artist.name;
  if (artist.uri && artist.uri.startsWith("tidal:")) {
    return (
      <>
        {addSep ? sep : null}
        <Button
          onClick={() => setExplore(artist)}
          sx={{
            lineHeight: "revert",
            textTransform: "revert",
            /* fontSize: "revert", */
            fontWeight: 500,
            padding: 0,
          }}
        >
          {artistIcon}
          {artistName}
        </Button>
      </>
    );
  } else {
    return (
      <HFlex>
        {addSep ? sep : null}
        {artistIcon}
        <span>{artistName}</span>
      </HFlex>
    );
  }
};

export const Artists = ({ artists, addSep, onlyFirst }) => {
  if (!artists || artists.length === 0) {
    return null;
  }

  if (onlyFirst) {
    return <Artist artist={artists[0]} addSep={addSep} />;
  } else {
    return (
      <>
        {artists.map((artist) => (
          <Artist artist={artist} addSep={addSep} key={artist.uri} />
        ))}
      </>
    );
  }
};

export const Album = ({ album, addSep }) => {
  if (!album) {
    return null;
  }
  const albumIcon = <GIcon name="album" style={{ paddingRight: "3px" }} />;
  const albumName = album.name;
  const date = album.date;
  return (
    <HFlex style={{ justifyContent: "center" }}>
      {addSep ? sep : null}
      {albumIcon}
      {date && ` ${albumName} (${date})`}
    </HFlex>
  );
};

export const Track = ({ track }) => {
  // line-height: 0px needed to center item vertically
  const trackElem = <span>{track.name || track.uri} </span>;
  return (
    <HFlex style={{ alignItems: "center" }}>
      {trackElem}
      <Artists artists={track.artists} addSep />
      <Album album={track.album} addSep />
    </HFlex>
  );
};

export const TrackWithDuration = ({ track }) => {
  const duration = duration_to_human(track.length, "∞");
  return (
    <HFlex style={{ justifyContent: "space-between" }}>
      <Track track={track} />
      <div style={{ textAlign: "right", paddingRight: "4px" }}>{duration}</div>
    </HFlex>
  );
};
