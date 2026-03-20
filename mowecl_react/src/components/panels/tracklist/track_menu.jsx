import { useEffect, useState } from "react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import RemoveIcon from "@mui/icons-material/Remove";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import { useMenuAnchor, useMopidyURL } from "@/hooks";
import { ListItemIcon, ListItemText } from "@mui/material";

const AddToPlaylistMenu = ({ item, mopidy, onParentClose, ...props }) => {
  const baseURL = useMopidyURL();
  const [playlists, setPlaylists] = useState(() => []);
  useEffect(() => {
    //TODO: cache playlists (or re-use from lib)
    console.log("Loading playlists");
    mopidy.playlists.asList().then((playlists) => {
      setPlaylists(
        playlists.filter((pl_item) => pl_item.uri.startsWith("tidal:")),
      );
    });
  }, [mopidy]);

  const handleAddToPlaylist = (item, pl_item) => {
    const url = `${baseURL}/mowecl/add_to_playlist?`;
    const track_uri = item.track.uri;
    const playlist_uri = pl_item.uri;
    fetch(
      url + new URLSearchParams({ playlist_uri, track_uri }).toString(),
    ).then(() => {
      props.onClose();
      onParentClose();
    });
  };
  return (
    <Menu
      {...props}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {playlists.map((pl_item) => {
        const playlist_provider = pl_item.uri.split(":")[0];
        const onClick = () => handleAddToPlaylist(item, pl_item);
        return (
          <MenuItem key={pl_item.uri} onClick={onClick}>
            <ListItemIcon>
              <PlaylistAddIcon />
            </ListItemIcon>
            <ListItemText>
              Add to {pl_item.name} ({playlist_provider})
            </ListItemText>
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export const TracklistItemMenu = ({ item, mopidy, ...props }) => {
  const { toggleMenu, menuProps } = useMenuAnchor();

  const handleRemoveClick = () =>
    mopidy.tracklist.remove({
      criteria: { tlid: [item.tlid] },
    });
  return (
    <Menu {...props}>
      <MenuItem onClick={handleRemoveClick}>
        <ListItemIcon>
          <RemoveIcon />
        </ListItemIcon>
        <ListItemText>Remove from tracklist</ListItemText>
      </MenuItem>
      {item.track.uri.startsWith("tidal:") && (
        <MenuItem onClick={toggleMenu}>
          <ListItemIcon>
            <MenuOpenIcon />
          </ListItemIcon>
          <ListItemText>Add to playlist</ListItemText>
          <AddToPlaylistMenu item={item} mopidy={mopidy} onParentClose={props.onClose} {...menuProps} />
        </MenuItem>
      )}
    </Menu>
  );
};
