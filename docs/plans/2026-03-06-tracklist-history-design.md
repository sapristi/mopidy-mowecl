# Tracklist History — Design

## Goal

Allow users to undo/redo tracklist changes. The backend records tracklist snapshots automatically; the frontend provides undo/redo buttons.

## Backend

### TracklistHistoryActor

A Pykka `ThreadingActor` implementing `CoreListener`.

**State:**
- `_history`: list of tracklist snapshots (each a list of track URIs)
- `_cursor`: int, current position in history
- `_max_size`: int, from config (default 50)
- `_restoring`: bool, flag to skip recording during restore

**On `tracklist_changed`:**
1. If `_restoring`, skip
2. Fetch `core.tracklist.get_tl_tracks()`, extract URIs
3. Compare with snapshot at cursor — skip if identical
4. Truncate forward history after cursor
5. Append new snapshot, increment cursor
6. Drop oldest entries if over max size

**`restore(direction)`:**
1. Move cursor back or forward
2. Set `_restoring = True`
3. Call `core.tracklist.clear()` then `core.tracklist.add(uris=snapshot)`
4. Set `_restoring = False`
5. Return `{can_undo, can_redo}`

**`get_info()`:**
- Returns `{can_undo: cursor > 0, can_redo: cursor < len(history) - 1}`

### HTTP Endpoints

- `GET /tracklist_history` — returns `{can_undo, can_redo}`
- `POST /tracklist_history_restore?direction=back|forward` — restores and returns `{can_undo, can_redo}`

Both receive the actor proxy via `initialize()`.

### Config

In `ext.conf`:
```
tracklist_history_size = 50
```

Schema entry added in `get_config_schema`.

### Lifecycle

Actor started in `factory()`. Its proxy is passed to the HTTP handlers. Routes registered before the catch-all static handler.

## Frontend

### Undo/Redo Buttons

Added to the existing `ButtonGroup` in `TracklistInfoPanel` (tracklist panel header).

- Undo icon (back arrow) + Redo icon (forward arrow)
- Tooltips: "Undo tracklist change" / "Redo tracklist change"
- Disabled when `can_undo` / `can_redo` is false

### State

`{can_undo, can_redo}` stored in local state or Zustand.

Refreshed:
- On component mount
- After each `tracklistChanged` WS event
- After a restore call (from the response)

### Restore

On button click: `POST /tracklist_history_restore?direction=back|forward`, update state from response.

### Base URL

Derived from mopidy WS URL (existing pattern used for Tidal favorites).
