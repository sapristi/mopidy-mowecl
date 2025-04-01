import { useAppState, useMopidyImage } from "@/hooks";
import {
  Card,
  CardMedia,
  Paper,
  Typography,
  CardContent,
  ButtonGroup,
  Button,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
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
        <PlayNowButton node={{ name, uri, type: "track" }} size="large" />
        <AddToTLButton node={{ name, uri, type: "track" }} size="large" />
      </ButtonGroup>
    </Card>
  );
};

const MusicBrainzInfoSection = ({
  name,
  type,
  begin_area,
  current_area,
  wikipedia_url,
  wikipedia_extract,
  life_span,
}) => {
  let vocab = null;
  if (type == "Person") {
    vocab = {
      begin: "born",
    };
  } else {
    vocab = {
      begin: "formed",
    };
  }
  let result = `${name}, `;

  if (life_span.begin || begin_area) {
    if (type == "Person") {
      result += "born";
    } else {
      result += "formed";
    }
    if (life_span.begin) {
      result += ` in ${life_span.begin}`;
    }
    if (begin_area) {
      result += ` in ${begin_area}`;
    }
  }
  if (current_area) {
    result += `, based in ${current_area}.`;
  }
  return (
    <div>
      {result}
      {wikipedia_url && (
        <>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {wikipedia_extract}
            <a href={wikipedia_url}>See more on wikipedia</a>
          </div>
        </>
      )}
    </div>
  );
};

export const ExplorePanel = () => {
  const explore = useAppState(useShallow((state) => state.explore));
  const mopidy = useSelector((state) => state.mopidy.client);
  const mopidyHost = useSelector(
    (store) => store.settings.persistant.mopidy_host,
  );
  const mopidyPort = useSelector(
    (store) => store.settings.persistant.mopidy_port,
  );

  const [items, setItems] = useState([]);
  const [lastFMArtistData, setLastFMArtistData] = useState(null);
  const [MBArtistData, setMBArtistData] = useState(null);

  const [bioOpen, setBioOpen] = useState(true);
  const [mbOpen, setMbOpen] = useState(true);

  useEffect(() => {
    if (!mopidy.library) {
      return;
    }
    if (!explore) {
      return;
    }
    setLastFMArtistData(null);
    setMBArtistData(null);
    mopidy.library.browse({ uri: explore.uri }).then(setItems);
    const protocol = window.location.protocol;
    const url_lastfm = `${protocol}//${mopidyHost}:${mopidyPort}/mowecl/get_lastfm_artist_data?`;
    fetch(
      url_lastfm +
        new URLSearchParams({ artist_name: explore.name }).toString(),
    ).then((response) => {
      response.json().then((data) => {
        setLastFMArtistData(data);
      });
    });

    const url_mb = `${protocol}//${mopidyHost}:${mopidyPort}/mowecl/get_musicbrainz_artist_data?`;
    fetch(
      url_mb + new URLSearchParams({ artist_name: explore.name }).toString(),
    ).then((response) => {
      response.json().then((data) => {
        setMBArtistData(data);
      });
    });
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

  const bioIcon = bioOpen ? (
    <ExpandLessIcon style={{ verticalAlign: "text-bottom" }} />
  ) : (
    <ExpandMoreIcon style={{ verticalAlign: "text-bottom" }} />
  );

  return (
    <Paper sx={{ padding: "30px" }}>
      {/* <img src={imageUrl} style={{maxHeight: "100px"}}/> */}
      <Typography variant="h2">{explore.name}</Typography>
      {lastFMArtistData && (
        <>
          <Typography variant="h4">
            LastFM data
            <Button onClick={() => setBioOpen(!bioOpen)}>{bioIcon}</Button>{" "}
          </Typography>

          {bioOpen && (
            <>
              <Typography variant="h5">
                {lastFMArtistData.listener_count} listeners on{" "}
                <a href={lastFMArtistData.url} target="_blank">
                  Last.FM
                </a>
              </Typography>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {lastFMArtistData.bio}
              </div>
            </>
          )}
        </>
      )}
      {MBArtistData && (
        <>
          <Typography variant="h4">
            MusicBrainz data
            <Button onClick={() => setMbOpen(!mbOpen)}>{bioIcon}</Button>{" "}
          </Typography>

          {mbOpen && <MusicBrainzInfoSection {...MBArtistData} />}
        </>
      )}

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
