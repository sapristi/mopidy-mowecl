const sanitizeItems = (items) => {
  items = items.slice(0, 50);
  const res = [];
  const uris = new Set();
  for (let item of items) {
    if (!uris.has(item.uri)) {
      res.push(item);
      uris.add(item.uri);
    }
  }
  return res;
};

export const handleSearchResults = (
  dispatch,
  rawSearchResults,
  search_history_length,
  input,
  selectedUri,
  setActivePanel,
) => {
  // rawSearchResults is a list of SearchResult (one item by backend)
  // Each SearchResult contains artist, album and tracks results
  // See https://docs.mopidy.com/stable/api/core/#mopidy.core.LibraryController.search
  rawSearchResults = rawSearchResults.filter((item) => Boolean(item.tracks));
  const search_results = rawSearchResults.map((item, i) => ({
    ...item,
    name: `${input} Search result (${item.uri})`,
    children: sanitizeItems(item.tracks),
    type: "search_result",
    expanded: true,
    uri: `search_result_${input}_${i}`, // TODO: use item.uri once mopidy-tidal is fixed
  }));

  // console.log("search", search_results);

  // const search_results = {
  //     uri: "search_result_" + input,
  //     name: `Search: ${input}`,
  //     children: [
  //         {
  //             uri: "search_result_" + input + "_tracks",
  //             name: `Tracks`,
  //             children: raw_search_result.tracks
  //         }
  //     ]
  // }
  dispatch({
    type: "LIBRARY_SET_CHILDREN",
    fun: () => search_results,
    target: ["search:"],
  });
  dispatch({
    type: "LIBRARY_SET_EXPANDED",
    target: ["search:"],
    data: true,
  });
  setActivePanel("library");
  if (search_history_length <= 0) return;

  const search_history_name = input + "/" + selectedUri;
  dispatch({
    type: "LIBRARY_SET_CHILDREN",
    fun: (c) =>
      [{ name: search_history_name, uri: search_history_name }, ...c].slice(
        0,
        search_history_length,
      ),
    target: ["search_history:"],
  });

  dispatch({
    type: "LIBRARY_SET_CHILDREN",
    fun: () => search_results,
    target: ["search_history:", search_history_name],
  });
};
