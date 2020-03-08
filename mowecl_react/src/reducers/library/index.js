
import { combineReducers } from 'redux'
import { setChildren, setExpanded, defaultNodeReducer, updateChildren } from './aux_functions'



import localforage from 'localforage'

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

const playlistReducer =
      (state = {name: "Playlists", uri: 'playlist:',
                type: "playlists_root", path: ["playlist:"], synced: null},
       action) =>
      {
          state = defaultNodeReducer(state, action)
          switch (action.type) {
          case "PLAYLIST_UNSYNC":
              state = {...state, synced: null}
              localStorage.setItem('synced', JSON.stringify(null))
              return state

          case "PLAYLIST_SYNC":
              state = {...state, synced: action.data}
              localStorage.setItem('synced', JSON.stringify(action.data))
              return state

          case "PLAYLIST_SYNCED_UPDATE":
              if (!state.synced) return state


          default:
              return state
          }
      }



const bookMarksReducer = (state = {name: "Bookmarks", uri: 'bookmark:',
                                   type: "bookmarks_root", path: ["bookmark:"], children: []},
                          action) =>
      {
          state = defaultNodeReducer(state, action)
          switch (action.type) {

          case "BOOKMARK_SAVE":
              localStorage.setItem('bookmarks', JSON.stringify(state))
              return state
          case "BOOKMARK_DELETE":
              state = {
                  ...state,
                  children: state.children.filter((bookmark) => bookmark.uri !== action.target)
              }
              console.log("DEL", state.children, action.target)
              localStorage.setItem('bookmarks', JSON.stringify(state))
              return state

          default:
              return state
          }
}

const searchResultsReducer =
      (state = {name: "Search results", uri: 'search:',
                type: 'search_results_root', path: ['search:'], children: []},
       action ) =>
      {
          return defaultNodeReducer(state, action)
      }

export const libraryReducer = (
    combineReducers({
        mopidyLibrary: mopidyLibraryReducer,
        playlists: playlistReducer,
        search_results: searchResultsReducer,
        bookmarks: bookMarksReducer
    }))
