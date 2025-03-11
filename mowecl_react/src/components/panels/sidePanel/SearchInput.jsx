import {
  memo,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useState,
  useMemo,
} from "react";
import { connect } from "react-redux";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

import { getSearchUris } from "@/utils";
import { handleSearchResults } from "./functions";
import { useAppState } from "@/hooks";

export const SearchInput = connect((state) => ({
  mopidyCli: state.mopidy.client,
  uri_schemes: state.settings.uri_schemes,
  search_history_length:
    state.settings.persistant.generic.search_history_length,
}))(({
  mopidyCli,
  uri_schemes,
  dispatch,
  closePopover,
  search_history_length,
}) => {
  const setActivePanel = useAppState((state) => state.setActivePanel);
  const searchUris = useMemo(() => getSearchUris(uri_schemes), [uri_schemes]);
  const initialSelecterUri = localStorage.getItem("searchSelectedURI") || "all";

  const [selectedUri, setSelectedUri] = useState(initialSelecterUri);
  const [input, setInput] = useState(() => "");

  const triggerSearch = (key) => {
    if (key !== "Enter") return;
    if (input.length === 0) return;

    const uri = selectedUri === "all" ? {} : { uris: [selectedUri + ":"] };
    // console.log("Search:", { query: { any: [input] }, ...uri });
    mopidyCli.library
      .search({ query: { any: [input] }, ...uri })
      .then((raw_search_results) => {
        console.log("search", raw_search_results);
        handleSearchResults(
          dispatch,
          raw_search_results,
          search_history_length,
          input,
          selectedUri,
          setActivePanel,
        );
      });
    closePopover();
  };

  return (
    <div>
      <TextField
        variant="outlined"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyPress={(event) => triggerSearch(event.key)}
        autoFocus={true}
      />
      <FormControl variant="outlined">
        <Select
          native
          value={selectedUri}
          onChange={(event) => {
            localStorage.setItem("searchSelectedURI", event.target.value);
            setSelectedUri(event.target.value);
          }}
          onKeyPress={(event) => triggerSearch(event.key)}
        >
          <option value={"all"}>All</option>
          {searchUris.map(([uri, uriHuman]) => (
            <option value={uri} key={uri}>
              {uriHuman}
            </option>
          ))}
        </Select>
      </FormControl>
    </div>
  );
});
