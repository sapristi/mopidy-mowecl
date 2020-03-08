
export const tracklistReducer = (state=[], action) => {
    switch (action.type) {
    case 'TRACKLIST_INITIALISE':
        return action.data

    default:
        return state
    }
}
