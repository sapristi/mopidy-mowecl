from types import SimpleNamespace

import pytest
from mopidy import core

from mopidy_mowecl.tracklist_history import TracklistHistoryFrontend


class _Done:
    def __init__(self, value=None):
        self._value = value

    def get(self):
        return self._value


class FakeTracklist:
    def __init__(self):
        self.uris = []

    def get_tl_tracks(self):
        return _Done(
            [SimpleNamespace(track=SimpleNamespace(uri=u)) for u in self.uris]
        )

    def clear(self):
        self.uris = []
        return _Done()

    def add(self, uris):
        self.uris = list(uris)
        return _Done()


@pytest.fixture
def frontend():
    fake_core = SimpleNamespace(tracklist=FakeTracklist())
    config = {"mowecl": {"tracklist_history_size": 10}}
    actor_ref = TracklistHistoryFrontend.start(config, fake_core)
    yield actor_ref.proxy(), fake_core
    actor_ref.stop()


def test_is_core_listener():
    assert issubclass(TracklistHistoryFrontend, core.CoreListener)


def test_undo_redo(frontend):
    proxy, fake_core = frontend
    for uris in (["a"], ["a", "b"]):
        fake_core.tracklist.uris = uris
        proxy.tracklist_changed().get()

    assert proxy.get_info().get() == {"can_undo": True, "can_redo": False}

    proxy.restore("back").get()
    assert fake_core.tracklist.uris == ["a"]

    proxy.restore("forward").get()
    assert fake_core.tracklist.uris == ["a", "b"]
