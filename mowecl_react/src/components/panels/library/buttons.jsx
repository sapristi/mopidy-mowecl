import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { useSelector, useDispatch } from "react-redux";

import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import ListItemIcon from "@mui/material/ListItemIcon";
// import ClearIcon from '@mui/icons-material/Clear'
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// import MoreVertIcon from '@mui/icons-material/MoreVert'
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Icon from "@mdi/react";
import { mdiPlaylistRemove } from "@mdi/js";

import { useConfirmDialogStore } from "@/components/molecules/confirmDialog";
import {
  expand_node,
  addToTracklist,
  addToTracklistAndPlay,
} from "./functions";
import { useMenuAnchor } from "@/hooks";
import { Menu } from "@mui/material";

export const PlayNowButton = ({ node, ...props }) => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const action = () => {
    mopidy.tracklist.clear();
    addToTracklistAndPlay(node, mopidy);
  };

  return (
    <Tooltip title="Play now !" followCursor>
      <Button {...props} onClick={action}>
        <PlaylistPlayIcon />
      </Button>
    </Tooltip>
  );
};

export const AddToTLButton = ({ node, ...props }) => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const action = () =>
    expand_node(node, mopidy).then((uris) => mopidy.tracklist.add({ uris }));
  return (
    <Tooltip title="Add to tracklist" followCursor>
      <Button {...props} onClick={action}>
        <PlaylistAddIcon />
      </Button>
    </Tooltip>
  );
};

const ResumeBookmarkButton = ({ node, ...props }) => {
  const bookmarksCli = useSelector((state) => state.bookmarks.client);
  const action = () => bookmarksCli.resume({ uri: node.uri });
  return (
    <Tooltip title="Resume bookmark" followCursor>
      <Button {...props} onClick={action}>
        <PlaylistPlayIcon />
      </Button>
    </Tooltip>
  );
};

const DeletePLButton = ({ node, ...props }) => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const setConfirmDialogState = useConfirmDialogStore(
    (state) => state.setState,
  );

  const callback = () => {
    mopidy.playlists.delete({ uri: node.uri });
  };
  const objectName = node.uri.startsWith("bookmark") ? "bookmark" : "playlist";

  const action = () => {
    setConfirmDialogState({
      text: `Delete ${objectName} ${node.name} ?`,
      callback,
    });
  };
  return (
    <Tooltip title={`Delete ${objectName} ` + node.name} followCursor>
      <Button {...props} onClick={action}>
        <Icon path={mdiPlaylistRemove} size={1} />
      </Button>
    </Tooltip>
  );
};

const PlayShuffledButton = ({ node, ...props }) => {
  const mopidy = useSelector((state) => state.mopidy.client);

  const action = () => {
    mopidy.tracklist.clear();
    addToTracklistAndPlay(node, mopidy, true);
  };

  return (
    <Button {...props} onClick={action}>
      Play shuffled
    </Button>
  );
};

export const FavButton = ({ node, ...props }) => {
  const favorites = useSelector((state) => state.library.favorites.children);
  const bookmarksCli = useSelector((state) => state.bookmarks.client);
  const dispatch = useDispatch();

  const alreadyFav = favorites.map((f) => f.uri).includes(node.uri);
  const action = () => {
    const newFavs = alreadyFav
      ? favorites.filter((c) => c.uri !== node.uri)
      : [...favorites, node];

    dispatch({
      type: "LIBRARY_SET_CHILDREN",
      target: ["favorite:"],
      fun: () => newFavs,
    });
    const newFavs_slim = newFavs.map((f) => ({
      ...f,
      children: undefined,
      __model__: undefined,
    }));
    bookmarksCli.store.set({ key: "favorites", value: newFavs_slim });
  };
  return (
    <IconButton
      size="small"
      {...props}
      onClick={action}
      style={{ marginRight: "10px" }}
      color="primary"
    >
      {alreadyFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
};

export const DefaultButtons = ({ node }) => {
  return (
    <ListItemIcon>
      <FavButton node={node} />
      <ButtonGroup size="small">
        <PlayNowButton node={node} />
        <AddToTLButton node={node} />
      </ButtonGroup>
    </ListItemIcon>
  );
};

export const PLButtons = ({ node }) => {
  const { toggleMenu, menuProps } = useMenuAnchor();
  return (
    <ListItemIcon>
      <FavButton node={node} />
      <ButtonGroup size="small">
        <PlayNowButton node={node} />
        <AddToTLButton node={node} />
        <Button
          type="button"
          onClick={toggleMenu}
          color={menuProps.open ? "info" : "default"}
        >
          <MoreVertIcon />
        </Button>
        <Menu {...menuProps}>
          <DeletePLButton node={node} />
          <PlayShuffledButton node={node} />
        </Menu>
      </ButtonGroup>
    </ListItemIcon>
  );
};

export const BMButtons = ({ node }) => {
  return (
    <ListItemIcon>
      <FavButton node={node} />
      <ButtonGroup size="small">
        <ResumeBookmarkButton node={node} />
        <AddToTLButton node={node} />
        <DeletePLButton node={node} />
      </ButtonGroup>
    </ListItemIcon>
  );
};
