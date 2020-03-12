
const setChildren_rec = (node, target, path, fun) => {
    if (target[0] === node.uri) {

        // console.log("lib_set_children", node, target, path, fun)
        if (target.length === 1) {

            // console.log("match:", node)
            const prev_children = node.children || []
            let new_children = fun(prev_children)

            if (Array.isArray(new_children))
                new_children = new_children.map(
                    child => {return {...child, path: [...path, child.uri]}}
                )
            return {...node, children: new_children}
        } else {
            return {
                ...node,
                children: node.children.map(
                    (child) =>
                        setChildren_rec(child, target.slice(1), path, fun))
            }}
    } else {return node}
}
export const setChildren = (node, target, fun) =>
    setChildren_rec(node, target, target, fun)


export const setExpanded = (node, target, fun) => {
    // console.log("lib_toggle", node, target, fun)

    if (target[0] === node.uri) {

        if (target.length === 1) {
            // console.log("match:", node)
            return { ...node, expanded: fun(node.expanded)}
        } else {

            if (node.children === undefined) return node
            return { ...node,
                     children: node.children.map(
                         (child) =>
                             setExpanded(child, target.slice(1), fun))
                   }
        }
    } else {return node}
}

export const updateChildren = (node, target, new_children) => {
    return setChildren(
        node, target,
        (previous_children) => {
            if (!previous_children) return new_children
            return new_children.map(
                (new_child) => {
                    const previous_child = previous_children.find(
                        c => c.uri === new_child.uri
                    )
                    if (previous_child) {
                        return {...new_child,
                                children: previous_child.children}
                    } else {
                        return new_child
                    }
                }
            )
        }
    )
}


export const defaultNodeReducer = (node, action) => {

    switch (action.type) {
    case 'LIBRARY_SET_CHILDREN':
        return setChildren(node, action.target, action.fun)

    case 'LIBRARY_UPDATE_CHILDREN':
        return updateChildren(node, action.target, action.data)

    case 'LIBRARY_TOGGLE_EXPANDED':
        return setExpanded(node, action.target, (x) => !x)

    case 'LIBRARY_SET_EXPANDED':
        return setExpanded(node, action.target, () => action.data)

    default:
        return node

    }


}
