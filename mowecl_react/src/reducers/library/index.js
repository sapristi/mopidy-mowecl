
import { combineReducers } from 'redux'
import { setChildren, setExpanded, defaultNodeReducer, updateChildren } from './aux_functions'


const mopidyLibraryReducer = (state = [], action) => {

    switch (action.type) {
    case 'MOPIDY_LIBRARY_INITIALISE':
        return action.data.map(node => ({...node, path: [node.uri]}))

    case 'LIBRARY_SET_CHILDREN':
        return state.map(node =>
                         setChildren(node, action.target, action.fun))

    case 'LIBRARY_UPDATE_CHILDREN':
        return state.map(node => updateChildren(node, action.target, action.data))

    case 'LIBRARY_TOGGLE_EXPANDED':
        return state.map(node => setExpanded(node, action.target, (x) => !x))

    case 'LIBRARY_SET_EXPANDED':
        return state.map(node => setExpanded(node, action.target, () => action.data))

    default:
        return state
    }

}

const playlistReducer = (
    state = {
        name: "Playlists",
        uri: 'playlist:',
        type: "playlists_root",
        path: ["playlist:"],
        children: []
    },
    action) => state = defaultNodeReducer(state, action)



const bookMarksReducer = (
    state = {name: "Bookmarks",
             uri: 'bookmark:',
             type: "bookmarks_root",
             path: ["bookmark:"],
             children: []},
    action) => defaultNodeReducer(state, action)

const searchResultsReducer =
      (state = {name: "Search results", uri: 'search:',
                type: 'search_results_root', path: ['search:'], children: []},
       action ) =>
      {
          return defaultNodeReducer(state, action)
      }


const searchHistoryReducer = 
    (state = {name: "Search history", uri: 'search_history:',
              type: 'search_history_root', path: ['search_history:'], children: []},
     action ) =>
        {
            return defaultNodeReducer(state, action)
        }

export const libraryReducer = (
    combineReducers({
        mopidyLibrary: mopidyLibraryReducer,
        playlists: playlistReducer,
        search_results: searchResultsReducer,
        search_history: searchHistoryReducer,
        bookmarks: bookMarksReducer
    }))
