import {memo, useEffect, useRef, useCallback, createContext, useState, useMemo} from 'react'
import {connect} from 'react-redux'

import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

import {getSearchUris} from '@/utils'

export const SearchInput = connect(
    state => ({
        mopidyCli: state.mopidy.client,
        uri_schemes: state.settings.uri_schemes,
        search_history_length: state.settings.persistant.generic.search_history_length
    })
)(({mopidyCli, uri_schemes, dispatch, closePopover, search_history_length}) => {

    const searchUris = useMemo(
        () => getSearchUris(uri_schemes),
        [uri_schemes]
    )
    const initialSelecterUri = localStorage.getItem("searchSelectedURI") || "all"

    const [selectedUri, setSelectedUri] = useState(initialSelecterUri)
    const [input, setInput] = useState(() => '')

    const triggerSearch = (key) => {
        if (key !== 'Enter') return
        if (input.length === 0) return

        const uri = (selectedUri === "all") ? {} : {uris: [selectedUri + ':']}
        console.log("Search:",  {query: {any: [input]}, ...uri})
        mopidyCli.library.search({query: {any: [input]}, ...uri}).then(
            search_result => {

                const search_results = search_result.map(
                    item => ({...item, name: item.uri, children: item.tracks,
                              type: 'search_result', expanded: true}))
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: () => search_results,
                    target: ['search:'],
                })
                dispatch({
                    type: 'LIBRARY_SET_EXPANDED',
                    target: ['search:'],
                    data: true
                })

                if (search_history_length <= 0)
                    return

                const search_history_name = input + '/' + selectedUri
                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: (c) => [{name: search_history_name, uri: search_history_name},
                                 ...c].slice(0, search_history_length),
                    target: ['search_history:']
                })

                dispatch({
                    type: 'LIBRARY_SET_CHILDREN',
                    fun: () => search_results,
                    target: ['search_history:', search_history_name]
                })
            }
        )
        closePopover()
    }

    return (
        <div>
          <TextField variant="outlined"
                     value={input} onChange={(event) => setInput(event.target.value)}
                     onKeyPress={event => triggerSearch(event.key)}
                     autoFocus={true}
          />
          <FormControl variant="outlined">
            <Select
              native
              value={selectedUri}
              onChange={ (event) => {
                  localStorage.setItem("searchSelectedURI", event.target.value)
                  setSelectedUri(event.target.value)}}
              onKeyPress={event => triggerSearch(event.key)}
            >
              <option value={"all"}>All</option>
              {
                  searchUris.map(
                      ([uri, uriHuman]) => <option value={uri} key={uri}>{uriHuman}</option>)
              }
            </Select>
          </FormControl>
        </div>)
})
