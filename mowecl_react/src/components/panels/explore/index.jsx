import { useAppState, useMopidyImage } from "@/hooks";
import {
  Card,
  CardMedia,
  Paper,
  Typography,
  CardContent,
  ButtonGroup,
} from "@mui/material";
import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { useShallow } from "zustand/react/shallow";
import { AddToTLButton, PlayNowButton } from "../library/buttons";

const AlbumItem = ({ name, uri }) => {
  const imageUrl = useMopidyImage(uri);
  return (
    <Card sx={{ width: 200 }}>
      <CardMedia component="img" image={imageUrl} />
      <CardContent>
        <Typography>{name}</Typography>
      </CardContent>
      <ButtonGroup
        sx={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <PlayNowButton node={{ name, uri }} size="large" />
        <AddToTLButton node={{ name, uri }} size="large" />
      </ButtonGroup>
    </Card>
  );
};

const TrackItem = ({ name, uri }) => {
  const imageUrl = useMopidyImage(uri);
  return (
    <Card
      sx={{
        height: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <CardMedia component="img" image={imageUrl} sx={{ width: 30 }} />
      <Typography>{name}</Typography>
      <ButtonGroup sx={{ display: "flex", justifyContent: "center" }}>
        <PlayNowButton node={{ name, uri }} size="large" />
        <AddToTLButton node={{ name, uri }} size="large" />
      </ButtonGroup>
    </Card>
  );
};

export const ExplorePanel = () => {
  const explore = useAppState(useShallow((state) => state.explore));
  const mopidy = useSelector((state) => state.mopidy.client);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!mopidy.library) {
      return;
    }
    if (!explore) {
      return;
    }
    mopidy.library.browse({ uri: explore.uri }).then(setItems);
  }, [explore?.uri]);
  // Not fetching artist image : too often missing anyway
  // const imageUrl = useMopidyImage(exploreUri)
  console.log("Explore", explore, items);
  if (!explore) {
    return <Paper>Nothing here</Paper>;
  }
  const albums = [];
  const tracks = [];
  for (let item of items) {
    if (item.type == "album") {
      albums.push(item);
    } else if (item.type == "track") {
      tracks.push(item);
    } else {
      console.warn("Unhandled type", item);
    }
  }

  return (
    <Paper sx={{ padding: "30px" }}>
      {/* <img src={imageUrl} style={{maxHeight: "100px"}}/> */}
      <Typography variant="h2">{explore.name}</Typography>

      <Typography variant="h4">Albums</Typography>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {albums.map((album) => (
          <AlbumItem name={album.name} uri={album.uri} key={album.uri} />
        ))}
      </div>
      <Typography variant="h4">Top tracks</Typography>
      <div style={{ display: "flex", gap: 5, flexDirection: "column" }}>
        {tracks.map((track) => (
          <TrackItem name={track.name} uri={track.uri} key={track.uri} />
        ))}
      </div>
    </Paper>
  );
};
