# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mopidy-Mowecl is a web client extension for [Mopidy](https://mopidy.com/) music server. It has two parts:
- **Python backend** (`mopidy_mowecl/`): A Mopidy extension that serves the web app and provides extra HTTP API endpoints (Tornado request handlers)
- **React frontend** (`mowecl_react/`): A React/Redux SPA using Material UI, built with Vite

## Build & Development Commands

### Frontend (from `mowecl_react/`)
```bash
pnpm install        # install dependencies
pnpm dev            # run dev server with hot reload
pnpm build          # production build (output goes to mopidy_mowecl/static via Vite)
pnpm lint           # run eslint
```

### Python package (from repo root)
```bash
pdm build           # build the Python wheel (includes frontend static files)
```

### Full build sequence
```bash
cd mowecl_react && pnpm install && pnpm build && cd .. && pdm build
```

### Linting/Testing (Python)
```bash
python -m black --check .          # format check
python -m flake8 --show-source     # lint
python -m pytest --cov=mopidy_mowecl --cov-report=term-missing
```

## Architecture

### Python Backend (`mopidy_mowecl/`)
- `__init__.py`: Mopidy extension entry point (`Extension` class). Defines config schema, registers HTTP routes, serves the frontend. Routes include the main file server and extra API endpoints.
- `file_server.py`: Tornado handler that renders `index.html` with server-side config injection (template params from Mopidy config).
- `web_api_extra.py`: Extra Tornado HTTP endpoints for Tidal playlist management (`/add_to_playlist`), Last.fm data (`/get_lastfm_artist_data`), and MusicBrainz data (`/get_musicbrainz_artist_data`).
- `misc_utils.py`: Wrapper classes for Last.fm and MusicBrainz APIs.
- `ext.conf`: Default Mopidy config values for the extension.
- Version is derived from SCM tags via `pdm-backend`.

### React Frontend (`mowecl_react/src/`)
- Uses `@` path alias (maps to `/src`) configured in `vite.config.js`.
- **State management**: Redux store with 6 reducers: `playback_state`, `tracklist`, `library`, `settings`, `mopidy`, `bookmarks`/`bookmarksState`. Additionally uses Zustand (`useAppState` in `hooks.js`) for UI state like active panel.
- **WebSocket communication**: `mopidy-js/` contains a bundled Mopidy.js client. `useWsClient` hook manages WS connections to both Mopidy and Bookmarks endpoints. Event dispatchers in `client_setup/` translate WS events to Redux actions.
- **Layout**: Dual-panel layout (`App.jsx`) with side panel + left panel (library/settings/explore) + right panel (tracklist). `AppSmall` variant for small screens uses single panel.
- **Component hierarchy**: `components/panels/` contains major UI sections (library, tracklist, footer, settings, explore, sidePanel). `components/atoms/` and `components/molecules/` contain shared primitives.
- **Reducers**: `reducers/library/` manages a tree structure for browsing (playlists, bookmarks, search results). `reducers/settings.jsx` handles persistent settings stored in `localStorage`.

### Key Dependencies
- Python: Mopidy >= 3.0, Mopidy-Bookmarks, Pykka, musicbrainzngs
- Frontend: React 18, Redux (classic, not RTK slices), Material UI v6, Vite, react-sortablejs (drag-and-drop), react-hotkeys, zustand

## Conventions

- Git commits: Do not include "Co-Authored-By: Claude" lines in commit messages
- Python: black formatting (line length 80), isort, flake8
- Frontend: ESLint config in `eslint.config.mjs`, uses JSX (not TypeScript)
- The frontend communicates with Mopidy via WebSocket (mopidy-js protocol), not REST
- Config flows from Mopidy config file -> server-side template injection -> Redux settings reducer -> localStorage for client overrides

## Release Process

- Version is derived from git tags via `pdm-backend` SCM versioning
- Tag format: `0.x.y` (no `v` prefix), alphas: `0.x.y-aN`
- Pushing a tag triggers `.github/workflows/publish.yaml` which builds frontend + wheel and publishes to PyPI
- Steps:
  1. Update changelog in `README.rst`
  2. Commit changes
  3. Create tag: `git tag 0.x.y`
  4. Push: `git push origin master && git push origin 0.x.y`

# Next steps

- Keep a history of the state of the tracklist
