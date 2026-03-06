# Tracklist History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow users to undo/redo tracklist changes via backend history tracking and frontend buttons.

**Architecture:** A Pykka frontend actor (`TracklistHistoryFrontend`) implements `CoreListener` to snapshot the tracklist on each `tracklist_changed` event. Two HTTP endpoints expose undo/redo. The frontend adds buttons to the tracklist header that call these endpoints.

**Tech Stack:** Python (Pykka, Tornado, Mopidy CoreListener), React (MUI buttons, Zustand state)

---

### Task 1: Create TracklistHistoryFrontend actor

**Files:**
- Create: `mopidy_mowecl/tracklist_history.py`

**Step 1: Write the actor class**

```python
import logging
import pykka
from mopidy import core

logger = logging.getLogger(__name__)


class TracklistHistoryFrontend(pykka.ThreadingActor, core.CoreListener):
    def __init__(self, config, core):
        super().__init__()
        self.core = core
        self._max_size = config["mowecl"]["tracklist_history_size"]
        self._history = []
        self._cursor = -1
        self._restoring = False

    def _get_info(self):
        return {
            "can_undo": self._cursor > 0,
            "can_redo": self._cursor < len(self._history) - 1,
        }

    def tracklist_changed(self):
        if self._restoring:
            return
        tl_tracks = self.core.tracklist.get_tl_tracks().get()
        uris = [t.track.uri for t in tl_tracks]

        if (
            self._history
            and self._cursor >= 0
            and uris == self._history[self._cursor]
        ):
            return

        # Truncate forward history
        self._history = self._history[: self._cursor + 1]
        self._history.append(uris)
        self._cursor = len(self._history) - 1

        # Enforce max size
        if len(self._history) > self._max_size:
            overflow = len(self._history) - self._max_size
            self._history = self._history[overflow:]
            self._cursor -= overflow

    def get_info(self):
        return self._get_info()

    def restore(self, direction):
        if direction == "back" and self._cursor > 0:
            self._cursor -= 1
        elif direction == "forward" and self._cursor < len(self._history) - 1:
            self._cursor += 1
        else:
            return self._get_info()

        uris = self._history[self._cursor]
        self._restoring = True
        try:
            self.core.tracklist.clear().get()
            self.core.tracklist.add(uris=uris).get()
        finally:
            self._restoring = False
        return self._get_info()
```

**Step 2: Verify file was created**

Run: `python3 -c "import ast; ast.parse(open('mopidy_mowecl/tracklist_history.py').read()); print('OK')"`
Expected: OK

**Step 3: Commit**

```bash
git add mopidy_mowecl/tracklist_history.py
git commit -m "feat: add TracklistHistoryFrontend actor"
```

---

### Task 2: Register actor and add config

**Files:**
- Modify: `mopidy_mowecl/__init__.py`
- Modify: `mopidy_mowecl/ext.conf`

**Step 1: Add config entry to ext.conf**

Add after `small_screen = false`:
```
tracklist_history_size = 50
```

**Step 2: Add schema entry in `get_config_schema`**

In `__init__.py`, add after the `schema["small_screen"]` line:
```python
schema["tracklist_history_size"] = config.Integer()
```

**Step 3: Register frontend actor in `setup()`**

In `__init__.py`, modify `setup()` to also register the frontend:
```python
def setup(self, registry):
    logger.info(f"Mowecl Version: {self.version}")
    from .tracklist_history import TracklistHistoryFrontend
    registry.add("frontend", TracklistHistoryFrontend)
    registry.add(
        "http:app",
        {
            "name": self.ext_name,
            "factory": self.factory
        },
    )
```

**Step 4: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('mopidy_mowecl/__init__.py').read()); print('OK')"`
Expected: OK

**Step 5: Commit**

```bash
git add mopidy_mowecl/__init__.py mopidy_mowecl/ext.conf
git commit -m "feat: register tracklist history actor and config"
```

---

### Task 3: Add HTTP endpoints

**Files:**
- Modify: `mopidy_mowecl/web_api_extra.py`
- Modify: `mopidy_mowecl/__init__.py`

**Step 1: Add handler classes to `web_api_extra.py`**

Append at end of file:
```python
class TracklistHistoryHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "GET, OPTIONS")

    def initialize(self, history_actor):
        self.history_actor = history_actor

    def get(self):
        info = self.history_actor.get_info().get()
        self.finish(json.dumps(info))

    def options(self):
        self.set_status(204)
        self.finish()


class TracklistHistoryRestoreHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header(
            "Access-Control-Allow-Methods", "POST, OPTIONS"
        )

    def initialize(self, history_actor):
        self.history_actor = history_actor

    def post(self):
        direction = self.get_argument("direction")
        if direction not in ("back", "forward"):
            self.set_status(400)
            self.finish(json.dumps(
                {"error": "direction must be 'back' or 'forward'"}
            ))
            return
        info = self.history_actor.restore(direction).get()
        self.finish(json.dumps(info))

    def options(self):
        self.set_status(204)
        self.finish()
```

**Step 2: Import new handlers in `__init__.py`**

Update the import line:
```python
from .web_api_extra import (
    AddToPlaylistRequestHandler,
    GetLastFMData,
    GetMusicBrainzData,
    TidalFavoriteArtistHandler,
    TidalFavoriteArtistsHandler,
    TracklistHistoryHandler,
    TracklistHistoryRestoreHandler,
)
```

**Step 3: Look up actor proxy and add routes in `factory()`**

In `factory()`, before the `return` statement, look up the actor and add routes:
```python
from .tracklist_history import TracklistHistoryFrontend
history_actor = pykka.ActorRegistry.get_by_class(
    TracklistHistoryFrontend
)[0].proxy()
```

Add `import pykka` at top of `__init__.py`.

Add routes to the returned list (before the catch-all):
```python
('/tracklist_history', TracklistHistoryHandler, {'history_actor': history_actor}),
('/tracklist_history_restore', TracklistHistoryRestoreHandler, {'history_actor': history_actor}),
```

**Step 4: Verify syntax**

Run: `python3 -c "import ast; ast.parse(open('mopidy_mowecl/__init__.py').read()) or ast.parse(open('mopidy_mowecl/web_api_extra.py').read()); print('OK')"`
Expected: OK

**Step 5: Commit**

```bash
git add mopidy_mowecl/__init__.py mopidy_mowecl/web_api_extra.py
git commit -m "feat: add tracklist history HTTP endpoints"
```

---

### Task 4: Add undo/redo buttons to frontend

**Files:**
- Modify: `mowecl_react/src/components/panels/tracklist/index.jsx`
- Modify: `mowecl_react/src/hooks.js`

**Step 1: Add tracklist history state to Zustand store**

In `hooks.js`, add to the `useAppState` store:
```javascript
tracklistHistory: { can_undo: false, can_redo: false },
setTracklistHistory: (info) => set({ tracklistHistory: info }),
fetchTracklistHistory: (baseURL) => {
  fetch(`${baseURL}/mowecl/tracklist_history`)
    .then((r) => r.json())
    .then((data) => set({ tracklistHistory: data }))
    .catch(() => {});
},
```

**Step 2: Add undo/redo buttons in `TracklistInfoPanel`**

In `tracklist/index.jsx`, add imports:
```javascript
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
```

And import `useAppState` and `useMopidyURL`:
```javascript
import { useAppState, useMopidyURL } from "@/hooks";
```

In the `TracklistInfoPanel` component, add before the existing `<ButtonGroup>`:
```jsx
const { tracklistHistory, fetchTracklistHistory } = useAppState();
const baseURL = useMopidyURL();

const handleRestore = (direction) => {
  fetch(`${baseURL}/mowecl/tracklist_history_restore?direction=${direction}`, {
    method: "POST",
  })
    .then((r) => r.json())
    .then((data) => useAppState.setState({ tracklistHistory: data }))
    .catch(() => {});
};
```

Add a new `ButtonGroup` before the existing one (between `<TracklistLength />` and `{currentBookmark &&`):
```jsx
<ButtonGroup size="small">
  <Tooltip title="Undo tracklist change" followCursor>
    <span>
      <Button
        disabled={!tracklistHistory.can_undo}
        onClick={() => handleRestore("back")}
      >
        <UndoIcon fontSize="small" />
      </Button>
    </span>
  </Tooltip>
  <Tooltip title="Redo tracklist change" followCursor>
    <span>
      <Button
        disabled={!tracklistHistory.can_redo}
        onClick={() => handleRestore("forward")}
      >
        <RedoIcon fontSize="small" />
      </Button>
    </span>
  </Tooltip>
</ButtonGroup>
```

Note: The `<span>` wrapper is needed because MUI `Tooltip` doesn't work on disabled buttons.

**Step 3: Refresh history state on `tracklistChanged` event**

In `mowecl_react/src/client_setup/mopidy.js`, inside the `event:tracklistChanged` handler, add after the existing dispatch:
```javascript
const mopidyURL = new URL(mopidyCli._settings.webSocketUrl);
const scheme = mopidyURL.protocol === "ws:" ? "http:" : "https:";
const baseURL = `${scheme}//${mopidyURL.host}`;
useAppState.getState().fetchTracklistHistory(baseURL);
```

Also add at top of file:
```javascript
import { useAppState } from "@/hooks";
```
(Note: `useAppState` is already imported — check first.)

And in the `state:online` handler, after the existing `fetchFavoriteArtists` call:
```javascript
useAppState.getState().fetchTracklistHistory(baseURL);
```

**Step 4: Verify frontend builds**

Run: `cd mowecl_react && pnpm lint`
Expected: No errors

**Step 5: Commit**

```bash
git add mowecl_react/src/hooks.js mowecl_react/src/components/panels/tracklist/index.jsx mowecl_react/src/client_setup/mopidy.js
git commit -m "feat: add undo/redo buttons to tracklist panel"
```
