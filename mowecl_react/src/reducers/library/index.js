import { match } from "@/utils";
import { combineReducers } from "redux";
import {
  setChildren,
  setExpanded,
  defaultNodeReducer,
  updateChildren,
} from "./aux_functions";

const mopidyLibraryReducer = (state = [], action) =>
  match(action.type)
    .on("MOPIDY_LIBRARY_INITIALISE", () =>
      action.data.map((node) => ({ ...node, path: [node.uri] })),
    )
    .on("LIBRARY_SET_CHILDREN", () =>
      state.map((node) => setChildren(node, action.target, action.fun)),
    )
    .on("LIBRARY_UPDATE_CHILDREN", () =>
      state.map((node) => updateChildren(node, action.target, action.data)),
    )
    .on("LIBRARY_TOGGLE_EXPANDED", () =>
      state.map((node) => setExpanded(node, action.target, (x) => !x)),
    )
    .on("LIBRARY_SET_EXPANDED", () =>
      state.map((node) => setExpanded(node, action.target, () => action.data)),
    )
    .otherwise(() => state);

const playlistReducer = (
  state = {
    name: "Playlists",
    uri: "playlist:",
    type: "playlists_root",
    path: ["playlist:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

const bookmarksReducer = (
  state = {
    name: "Bookmarks",
    uri: "bookmark:",
    type: "bookmarks_root",
    path: ["bookmark:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

const searchResultsReducer = (
  state = {
    name: "Search results",
    uri: "search:",
    type: "search_results_root",
    path: ["search:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

const searchHistoryReducer = (
  state = {
    name: "Search history",
    uri: "search_history:",
    type: "search_history_root",
    path: ["search_history:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

const favoritesReducer = (
  state = {
    name: "Favorites",
    uri: "favorite:",
    type: "favorites_root",
    path: ["favorite:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

const exploreReducer = (
  state = {
    name: "Explore",
    uri: "explore:",
    type: "explore_root",
    path: ["explore:"],
    children: [],
  },
  action,
) => defaultNodeReducer(state, action);

export const libraryReducer = combineReducers({
  mopidyLibrary: mopidyLibraryReducer,
  playlists: playlistReducer,
  search_results: searchResultsReducer,
  search_history: searchHistoryReducer,
  bookmarks: bookmarksReducer,
  favorites: favoritesReducer,
  explore: exploreReducer,
});
