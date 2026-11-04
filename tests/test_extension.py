"""Smoke tests that must pass on both Mopidy 3.x and Mopidy 4.x."""

import configparser

from mopidy import ext

import mopidy_mowecl
from mopidy_mowecl import Extension


def test_version_is_set():
    assert isinstance(mopidy_mowecl.__version__, str)
    assert Extension.version == mopidy_mowecl.__version__


def test_default_config_is_valid():
    extension = Extension()
    parser = configparser.RawConfigParser()
    parser.read_string(extension.get_default_config())
    values = dict(parser["mowecl"])

    _, errors = extension.get_config_schema().deserialize(values)

    assert errors == {}


def test_setup_registers_frontend_and_http_app():
    from mopidy_mowecl.tracklist_history import TracklistHistoryFrontend

    registry = ext.Registry()
    Extension().setup(registry)

    assert TracklistHistoryFrontend in registry["frontend"]
    apps = registry["http:app"]
    assert len(apps) == 1
    assert apps[0]["name"] == "mowecl"
    assert callable(apps[0]["factory"])


def test_factory_returns_routes(tmp_path):
    config = {
        "mowecl": {
            "dev_static_path": str(tmp_path),
            "lastfm_api_key": None,
            "lastfm_api_secret": None,
        }
    }
    routes = Extension().factory(config, core=None)
    paths = [route[0] for route in routes]
    assert "/tracklist_history" in paths
    assert r"/(.*)" in paths


def test_factory_serves_packaged_static_files_by_default():
    import pathlib

    config = {
        "mowecl": {
            "dev_static_path": None,
            "lastfm_api_key": None,
            "lastfm_api_secret": None,
        }
    }
    routes = Extension().factory(config, core=None)
    static_root = dict((r[0], r[-1]) for r in routes)[r"/(.*)"]["path"]
    assert static_root == pathlib.Path(mopidy_mowecl.__file__).parent / "static"
