import { notify, obj_reducer } from "@/utils";
import { updateOrInsert } from "@/reducers/library/aux_functions";
import { useAppState } from "@/hooks";
import { getLogger } from "@/logger";

const log = getLogger("mopidy-events");

const fetchPlaybackInfo = async (mopidyCli, dispatch) => {
  const to_dispatch = [
    {
      fun_path: ["playback", "getCurrentTlTrack"],
      base: { type: "PLAYBACK_INFO", target: "tltrack" },
    },
    {
      fun_path: ["playback", "getState"],
      base: { type: "PLAYBACK_INFO", target: "state" },
    },
    {
      fun_path: ["playback", "getTimePosition"],
      base: { type: "PLAYBACK_INFO", target: "time_position" },
    },
  ];

  await Promise.all(
    to_dispatch.map(async ({ fun_path, base }) => {
      fun_path.reduce((obj, name) => obj[name], mopidyCli);

      const fun = fun_path.reduce(obj_reducer, mopidyCli);
      const res = await fun();
      dispatch(Object.assign({}, base, { data: res }));
    }),
  );
};

const fetchTracklistOptions = (mopidyCli, dispatch) => {
  const options = ["Repeat", "Single", "Random"];

  Promise.all(
    options.map((option) => mopidyCli.tracklist[`get${option}`]()),
  ).then((states) => {
    const tlstate = Object.fromEntries(
      states.map((state, i) => [options[i], state]),
    );
    dispatch({
      type: "SET_TRACKLIST_STATE",
      target: "Random",
      data: tlstate,
    });
  });
};

// Below this downtime, a reconnection keeps the library as loaded (expanded
// nodes, fetched children) instead of re-initialising it. Changes missed while
// disconnected (e.g. playlist changes) are then only seen after a reload.
export const LIBRARY_RELOAD_MIN_DOWNTIME_MS = 10_000;

export const shouldReloadLibrary = (isFirstConnect, disconnectedAt, now) =>
  isFirstConnect ||
  disconnectedAt === null ||
  now - disconnectedAt >= LIBRARY_RELOAD_MIN_DOWNTIME_MS;

export const initMopidyEventsDispatcher = (
  mopidyCli,
  dispatch,
  setActivePanel,
  baseURL,
) => {
  let isFirstConnect = true;
  // time of the first disconnection since the last successful connection
  let disconnectedAt = null;
  mopidyCli.on("event", (...args) => log.debug("event", ...args));
  mopidyCli.on("requests:count", (value) => {
    dispatch({
      type: "PENDING_REQUESTS_COUNT",
      endpoint: "mopidy",
      data: value,
    });
  });
  mopidyCli.on("state:online", async () => {
    dispatch({
      type: "CLIENT_CONNECTED",
      endpoint: "mopidy",
    });
    dispatch({ type: "UPDATE_CLIENT", endpoint: "mopidy", client: mopidyCli });
    useAppState.getState().fetchFavoriteArtists(baseURL);
    useAppState.getState().fetchTracklistHistory(baseURL);
    const reloadLibrary = shouldReloadLibrary(
      isFirstConnect,
      disconnectedAt,
      Date.now(),
    );
    if (!reloadLibrary) {
      log.info(
        `reconnected after ${Date.now() - disconnectedAt}ms: keeping library`,
      );
    }
    disconnectedAt = null;
    if (isFirstConnect) {
      setActivePanel("library");
      isFirstConnect = false;
    }
    mopidyCli.tracklist.getTlTracks().then(async (tltracks) => {
      dispatch({
        type: "TRACKLIST_INITIALISE",
        data: tltracks,
      });
      if (!reloadLibrary) return;
      const playlistsAll = await mopidyCli.playlists.asList();
      const playlists = playlistsAll.filter(
        (pl) => !pl.uri.startsWith("bookmark:"),
      );
      const bookmarks = playlistsAll.filter((pl) =>
        pl.uri.startsWith("bookmark:"),
      );
      dispatch({
        type: "LIBRARY_SET_CHILDREN",
        target: ["playlist:"],
        fun: () => playlists,
      });
      dispatch({
        type: "LIBRARY_SET_CHILDREN",
        target: ["bookmark:"],
        fun: () => bookmarks,
      });
    });

    mopidyCli.mixer.getVolume().then((volume) =>
      dispatch({
        type: "PLAYBACK_INFO",
        target: "volume",
        data: volume,
      }),
    );

    if (reloadLibrary) {
      mopidyCli.library.browse({ uri: null }).then((library) =>
        dispatch({
          type: "MOPIDY_LIBRARY_INITIALISE",
          data: library,
        }),
      );
    }

    mopidyCli.getUriSchemes().then((schemes) =>
      dispatch({
        type: "URI_SCHEMES",
        data: schemes,
      }),
    );

    fetchPlaybackInfo(mopidyCli, dispatch);
    fetchTracklistOptions(mopidyCli, dispatch);
  });

  mopidyCli.on("state:offline", () => {
    // also emitted on each failed reconnection attempt: keep the first time
    if (disconnectedAt === null) disconnectedAt = Date.now();
    dispatch({
      type: "CLIENT_DISCONNECTED",
      endpoint: "mopidy",
    });
  });

  mopidyCli.on("event:trackPlaybackResumed", (data) => {
    dispatch({
      type: "PLAYBACK_INFO",
      target: "state",
      data: "playing",
    });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "time_position",
      data: data.time_position,
    });
  });

  mopidyCli.on("event:trackPlaybackPaused", (data) => {
    dispatch({
      type: "PLAYBACK_INFO",
      target: "state",
      data: "paused",
    });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "time_position",
      data: data.time_position,
    });
    dispatch({
      type: "INCR_PLAYBACK_RESET",
    });
  });

  mopidyCli.on("event:seeked", (data) => {
    dispatch({
      type: "PLAYBACK_INFO",
      target: "time_position",
      data: data.time_position,
    });
  });

  mopidyCli.on("event:trackPlaybackStarted", (data) => {
    dispatch({
      type: "PLAYBACK_INFO",
      target: "track",
      data: data.track,
    });
  });

  mopidyCli.on("event:trackPlaybackEnded", () => {
    dispatch({ type: "CLEAR_PLAYBACK_INFO" });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "state",
      data: "stopped",
    });
  });

  mopidyCli.on("event:trackPlaybackStarted", (data) => {
    dispatch({ type: "INCR_PLAYBACK_RESET" });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "state",
      data: "playing",
    });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "time_position",
      data: 0,
    });
    dispatch({
      type: "PLAYBACK_INFO",
      target: "tltrack",
      data: data.tl_track,
    });

    const track = data.tl_track.track;
    mopidyCli.library.getImages({ uris: [track.uri] }).then((response) => {
      if (response) {
        if (response[track.uri].length > 0) {
          let url = response[track.uri][0].uri;
          // uri returned by mopidy local is relative, so we have to take mopidy url into account
          url = new URL(url, baseURL).href;

          notify(
            track.name,
            `${track?.artists[0]?.name} - ${track?.album?.name}`,
            "track_change",
            url,
          );
        } else {
          notify(
            track.name,
            `${(track?.artists || [])[0]?.name} - ${track?.album?.name}`,
            "track_change",
          );
        }
      }
    });
  });

  mopidyCli.on("event:tracklistChanged", () => {
    mopidyCli.tracklist.getTlTracks().then((data) =>
      dispatch({
        type: "TRACKLIST_INITIALISE",
        data: data,
      }),
    );
    fetchPlaybackInfo(mopidyCli, dispatch);
    useAppState.getState().fetchTracklistHistory(baseURL);
  });

  mopidyCli.on("event:optionsChanged", () =>
    fetchTracklistOptions(mopidyCli, dispatch),
  );

  mopidyCli.on("event:volumeChanged", (data) => {
    dispatch({
      type: "PLAYBACK_INFO",
      target: "volume",
      data: data.volume,
    });
  });

  mopidyCli.on("event:playlistChanged", ({ playlist }) => {
    const libItem = {
      ...playlist,
      type: "playlist",
      children: playlist.tracks,
    };
    const target = playlist.uri.startsWith("bookmark:")
      ? ["bookmark:"]
      : ["playlist:"];
    dispatch({
      type: "LIBRARY_SET_CHILDREN",
      target,
      fun: (prevPlaylists) => updateOrInsert(prevPlaylists, libItem),
    });
  });

  mopidyCli.on("event:playlistDeleted", ({ uri }) => {
    const target = uri.startsWith("bookmark:") ? ["bookmark:"] : ["playlist:"];
    dispatch({
      type: "LIBRARY_SET_CHILDREN",
      target,
      fun: (prevPlaylists) => prevPlaylists.filter((item) => item.uri !== uri),
    });
  });
};
