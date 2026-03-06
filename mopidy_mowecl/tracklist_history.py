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
        elif (
            direction == "forward"
            and self._cursor < len(self._history) - 1
        ):
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
