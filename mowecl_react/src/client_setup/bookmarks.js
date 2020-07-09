import { match } from 'utils'
import {updateOrInsert} from 'reducers/library/aux_functions'

export const initBookmarksEventsDispatcher = (bookmarksCli, dispatch) => {
    bookmarksCli.on('event', console.log)

    bookmarksCli.on("requests:count", (value) => {
        dispatch({
            type: 'PENDING_REQUESTS_COUNT',
            endpoint: 'bookmarks',
            data: value
        })
    })

    bookmarksCli.on("state:online", async () => {
        dispatch({
            type: 'CLIENT_CONNECTED',
            endpoint: 'bookmarks'
        })
        bookmarksCli.getSyncStatus().then(
            ({current_bookmark}) => dispatch({
                type: "BOOKMARKS_SYNC_STATUS",
                data: current_bookmark
            })
        )
        bookmarksCli.asList().then(
            (bookmarks) => {
                console.log("Got bookmarks", bookmarks)
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    target: ["bookmark:"],
                    fun: () => bookmarks,
                })
            }
        )
        dispatch({type: 'UPDATE_CLIENT', endpoint: "bookmarks", client: bookmarksCli})
    })

    bookmarksCli.on("state:offline", () => dispatch({
        type: 'CLIENT_DISCONNECTED',
        endpoint: "bookmarks"
    }))

    bookmarksCli.on("event:syncStatusUpdate", newStatus => {
        dispatch({
            type: "BOOKMARKS_SYNC_STATUS",
            data: newStatus.bookmark
    })})


    bookmarksCli.on("event:bookmarkChanged", ({bookmark}) => {
        const libItem = {
            ...bookmark,
            type: "playlist",
            children: bookmark.tracks
        }
        dispatch({
            type: "LIBRARY_SET_CHILDREN",
            target: ["bookmark:"],
            fun: prevBookmarks => updateOrInsert(prevBookmarks, libItem)
        })
    })

    bookmarksCli.on("event:bookmarkDeleted", ({uri}) => {
        dispatch({
            type: "LIBRARY_SET_CHILDREN",
            target: ["bookmark:"],
            fun: prevBookmarks => prevBookmarks.filter(
                item => item.uri !== uri
            )
        })
    })
    console.log("BMCLI", bookmarksCli)
}

const defaultState = {
    currentBookmark: null
}

export const bookmarksStateReducer = (state=defaultState, action) => {
    return match(action.type)
        .on("BOOKMARKS_SYNC_STATUS", () =>
            ({currentBookmark: action.data})
           )
        .otherwise(() => state)
}
