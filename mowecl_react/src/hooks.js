import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
} from "react";
import { useSelector } from "react-redux";
import { create } from "zustand";
import { buildMopidyUrl } from "@/utils";

export function useTraceUpdate(props) {
  const prev = useRef(props);
  useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log("Changed props:", changedProps);
    }
    prev.current = props;
  });
}

export const useMenuAnchor = () => {
  const [anchorEl, setanchorEl] = useState(null);

  const toggleMenu = (event) => {
    const target = event.target;
    setanchorEl(anchorEl ? null : target);
  };
  const closeMenu = () => {
    setanchorEl(null);
  };

  const open = Boolean(anchorEl);
  return { toggleMenu, menuProps: { onClose: closeMenu, anchorEl, open } };
};

export const useAppState = create((set) => ({
  activePanelName: "library",
  explore: null,
  favoriteArtistIds: new Set(),
  setState: set,
  setActivePanel: (value) => set({ activePanelName: value }),
  setExplore: (item) => set({ activePanelName: "explore", explore: item }),
  setFavoriteArtistIds: (ids) => set({ favoriteArtistIds: new Set(ids) }),
  fetchFavoriteArtists: (baseURL) => {
    fetch(`${baseURL}/mowecl/tidal_favorite_artists`)
      .then((r) => r.json())
      .then((data) => {
        set({ favoriteArtistIds: new Set(data.favorite_artist_ids) });
      })
      .catch(() => {});
  },
  tracklistHistory: { can_undo: false, can_redo: false },
  setTracklistHistory: (info) => set({ tracklistHistory: info }),
  fetchTracklistHistory: (baseURL) => {
    fetch(`${baseURL}/mowecl/tracklist_history`)
      .then((r) => r.json())
      .then((data) => set({ tracklistHistory: data }))
      .catch(() => {});
  },
}));

export const useMopidyImage = (uri) => {
  const mopidy = useSelector((state) => state.mopidy.client);
  const baseURL = useMopidyURL();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!mopidy.library) {
      setImageUrl(null);
      return;
    }
    if (!uri || uri == null) {
      setImageUrl(null);
      return;
    }
    mopidy.library.getImages({ uris: [uri] }).then((response) => {
      if (response) {
        if (response[uri].length > 0) {
          let url = response[uri][0].uri;
          // uri returned by mopidy local is relative, so we have to take mopidy url into account
          url = new URL(url, baseURL).href;
          setImageUrl(url);
        } else {
          setImageUrl(null);
        }
      }
    });
  }, [uri]);
  return imageUrl;
};

export const useMopidyURL = () => {
  const mopidyHost = useSelector(
    (store) => store.settings.persistant.mopidy_host,
  );
  const mopidyPort = useSelector(
    (store) => store.settings.persistant.mopidy_port,
  );

  return buildMopidyUrl(mopidyHost, mopidyPort);
};
