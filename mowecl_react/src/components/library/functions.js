
export const isLeaf = (node) => node.type === "track" || node.__model__ === "Track"

export const toggleNode = (node, dispatch, mopidy) => {
    // node does not toggle
    if (isLeaf(node)) return

    dispatch({
        type: 'LIBRARY_TOGGLE_EXPANDED',
        target: node.path
    })

    if (node.children && node.children.length > 0)
        return

    switch (node.type) {

    case 'playlists_root':
        mopidy.playlists.asList().then(
            playlists => dispatch({
                type: 'LIBRARY_SET_CHILDREN',
                target: node.path,
                fun: () => playlists,
            })
        )
        break

    case 'playlist':
        // console.log("toggle", node)
        mopidy.playlists.getItems({uri: node.uri}).then(
            items => dispatch({
                type: 'LIBRARY_SET_CHILDREN',
                target: node.path,
                fun: () => (items || [])
            })
        )
        break

    case 'search_results_root':
        break

    case 'search_result':
        break

    default:
        mopidy.library.browse({uri: node.uri}).then(
            (children) => dispatch({
                type: 'LIBRARY_UPDATE_CHILDREN',
                target: node.path,
                fun: () => children,
                data: children
            }))
    }
}


export const rec_expand_node = async(lib_items, mopidy) => {

    if (lib_items.length === 0) return []
    // console.log("Expanding ", lib_items)

    const res = await Promise.all(lib_items.map(
        async (lib_item) =>
            {
                if (isLeaf(lib_item)) {
                    return lib_item.uri
                }
                else {
                    // console.log("Browsing", lib_item)

                    switch (lib_item.type) {
                    case 'playlist':
                        if (!lib_item.children) {
                            const children = await mopidy.playlists.getItems({uri: lib_item.uri})
                            // console.log("pl children", children)
                            return children.map(item => item.uri)
                        } else {
                            return lib_item.children.map(item => item.uri)
                        }

                    case 'search_result':
                        return lib_item.children.map(item => item.uri)

                    default:

                        let uri_expanded = await mopidy.library.browse({uri: lib_item.uri})
                        // console.log(lib_item, "browsed to ", uri_expanded)
                        if (uri_expanded.length === 0 && lib_item.children) {
                            uri_expanded = lib_item.children
                        }
                        return await rec_expand_node(uri_expanded, mopidy)
                    }
                  }
            }))
    // console.log("Expanded", res.flat())
    return res.flat()
}


export const expand_node = async (node, mopidy) => {

    if (isLeaf(node)) return [node.uri]

    let data_raw = (await rec_expand_node([node], mopidy))
    // console.log('Returning', data_raw)

    // filter on track length ?? no because some tracks do not have length
    const data = data_raw.filter( i => (i !== null))
    return data
}


export const addToTracklist = async (node, at_position, mopidy) => {
    const uris = await expand_node(node, mopidy)
    const tltracks = await mopidy.tracklist.add({uris: uris, at_position})
    return tltracks
}

