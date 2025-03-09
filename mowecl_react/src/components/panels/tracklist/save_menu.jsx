import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { create } from "zustand";

import MenuItem from "@mui/material/MenuItem";

import Popover from "@mui/material/Popover";
import SaveIcon from "@mui/icons-material/Save";
import { Input } from "@/components/molecules";
import { useConfirmDialogStore } from "@/components/molecules/confirmDialog";

export const defaultMenuState = {
  uri_scheme: null,
  label: null,
  anchorEl: null,
  previousItems: null,
  create_callback: null,
};

export const usePlaylistSaveMenuStore = create((set) => ({
  ...defaultMenuState,
  setState: set,
  reset: () => set(defaultMenuState),
}));

export const savePlaylist = async (mopidy, uri, tracklist) => {
  const playlist = await mopidy.playlists.lookup({ uri });
  playlist.tracks = tracklist.map((tlt) => tlt.track);
  return await mopidy.playlists.save({ playlist: playlist });
};

export const createPlaylist = async (mopidy, name, tracklist, uri_scheme) => {
  const playlist = await mopidy.playlists.create({
    name: name,
    uri_scheme: uri_scheme,
  });
  return await savePlaylist(mopidy, playlist.uri, tracklist);
};

export const SaveMenu = () => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const tracklist = useSelector((state) => state.tracklist);
  const setConfirmDialogState = useConfirmDialogStore(
    (state) => state.setState,
  );
  const bookmarks = useSelector((state) => state.library.bookmarks.children);
  const playlists = useSelector((state) => state.library.playlists.children);
  const menuState = usePlaylistSaveMenuStore();

  const playlistsAll = useMemo(
    () => ({
      bookmarks: bookmarks,
      playlists: playlists,
    }),
    [bookmarks, playlists],
  );

  const previousItems = playlistsAll[menuState.previousItems] || [];

  const saveAction = (name) => {
    const previous_playlist = previousItems.filter(
      (item) => item.name === name,
    );
    if (previous_playlist.length > 0) {
      setConfirmDialogState({
        text: `Overwrite ${menuState.label} ${name} ?`,
        callback: () => {
          savePlaylist(mopidy, previous_playlist[0].uri, tracklist).then(
            (playlist) => menuState.create_callback(playlist),
          );
        },
      });
    } else {
      console.log("Creating", name, menuState.uri_scheme);
      createPlaylist(mopidy, name, tracklist, menuState.uri_scheme).then(
        (playlist) => menuState.create_callback(playlist),
      );
    }
    menuState.reset();
  };

  return (
    <Popover
      anchorEl={menuState.anchorEl}
      open={Boolean(menuState.anchorEl)}
      onClose={menuState.reset}
      onKeyPress={() => {}}
    >
      <MenuItem>
        <Input
          label={"New " + menuState.label}
          icon={<SaveIcon />}
          action={saveAction}
        />
      </MenuItem>
      {previousItems.map((item) => (
        <MenuItem key={item.uri} onClick={() => saveAction(item.name)}>
          {item.name}
        </MenuItem>
      ))}
    </Popover>
  );
};
