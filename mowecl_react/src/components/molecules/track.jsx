import { HFlex } from "@/components/atoms";
import { GIcon } from "@/components/molecules";
import { useAppState } from "@/hooks";

import { duration_to_human } from "@/utils";

export const Track = ({ track }) => {
  // line-height: 0px needed to center item vertically
  const sep = <span style={{ lineHeight: "0px" }}> ⁕ </span>;
  const trackElem = <span>{track.name || track.uri} </span>;
  let artistElem = null;
  let albumElem = null;

  try {
    const artistIcon = <GIcon name="artist" style={{ paddingRight: "3px" }} />;
    const artist = track.artists[0].name;
    artistElem = (
      <>
        {sep}
        {artistIcon}
        <span>{artist}</span>
      </>
    );
  } catch (e) {
    // console.warn("Failed formatting artist");
  }
  try {
    const albumIcon = <GIcon name="album" style={{ paddingRight: "3px" }} />;
    const album = track.album.name;
    const date = track.album.date;
    albumElem = (
      <>
        {sep}
        {albumIcon}
        <span>
          {" "}
          {album} ({date})
        </span>
      </>
    );
  } catch (e) {
    // console.warn("Failed formatting album");
  }

  return (
    <HFlex style={{ alignItems: "center" }}>
      {trackElem}
      {artistElem}
      {albumElem}
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
