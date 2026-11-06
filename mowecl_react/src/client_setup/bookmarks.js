import { match } from "@/utils";
import { getLogger } from "@/logger";
import { shouldReloadLibrary } from "./mopidy";

const log = getLogger("bookmarks-events");

export const initBookmarksEventsDispatcher = (bookmarksCli, dispatch) => {
  let isFirstConnect = true;
  // time of the first disconnection since the last successful connection
  let disconnectedAt = null;
  bookmarksCli.on("event", (name, data) => log.debug(name, data));

  bookmarksCli.on("requests:count", (value) => {
    dispatch({
      type: "PENDING_REQUESTS_COUNT",
      endpoint: "bookmarks",
      data: value,
    });
  });

  bookmarksCli.on("state:online", async () => {
    dispatch({
      type: "CLIENT_CONNECTED",
      endpoint: "bookmarks",
    });
    bookmarksCli.getCurrentBookmark().then((current_bookmark) =>
      dispatch({
        type: "BOOKMARKS_SYNC_STATUS",
        data: current_bookmark ? current_bookmark.name : null,
      }),
    );
    const reloadFavorites = shouldReloadLibrary(
      isFirstConnect,
      disconnectedAt,
      Date.now(),
    );
    if (!reloadFavorites) {
      const downForSec = ((Date.now() - disconnectedAt) / 1000).toFixed(1);
      log.info(`Reconnected after ${downForSec}s down: keeping favorites`);
    }
    isFirstConnect = false;
    disconnectedAt = null;
    if (reloadFavorites) {
      bookmarksCli.store.get({ key: "favorites" }).then((favorites) => {
        if (favorites) {
          dispatch({
            type: "LIBRARY_SET_CHILDREN",
            target: ["favorite:"],
            fun: () => favorites,
          });
        }
      });
    }
    dispatch({
      type: "UPDATE_CLIENT",
      endpoint: "bookmarks",
      client: bookmarksCli,
    });
  });

  bookmarksCli.on("state:offline", () => {
    // also emitted on each failed reconnection attempt: keep the first time
    if (disconnectedAt === null) disconnectedAt = Date.now();
    dispatch({
      type: "CLIENT_DISCONNECTED",
      endpoint: "bookmarks",
    });
  });

  bookmarksCli.on("event:syncStatusUpdate", (newStatus) => {
    dispatch({
      type: "BOOKMARKS_SYNC_STATUS",
      data: newStatus.bookmark,
    });
  });
};

const defaultState = {
  currentBookmark: null,
};

export const bookmarksStateReducer = (state = defaultState, action) => {
  return match(action.type)
    .on("BOOKMARKS_SYNC_STATUS", () => ({ currentBookmark: action.data }))
    .otherwise(() => state);
};
