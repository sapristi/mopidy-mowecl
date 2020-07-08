import { match } from 'utils'

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

        dispatch({type: 'UPDATE_CLIENT', endpoint: "bookmarks", client: bookmarksCli})
    })

    bookmarksCli.on("state:offline", () => dispatch({
        type: 'CLIENT_DISCONNECTED',
        endpoint: "bookmarks"
    }))

    bookmarksCli.on("event:syncStatusUpdate", newStatus => {
        console.log("NEW BOOKMARKS_STATUS", newStatus)
        dispatch({
            type: "BOOKMARKS_SYNC_STATUS",
            data: newStatus.bookmark
    })})

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
