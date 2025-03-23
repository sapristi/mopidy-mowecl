import logging
import json
import pylast

import tornado.web

logger = logging.getLogger(__name__)


class AddToPlaylistRequestHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        # TODO: reuse settings from mopidy HTTP ?
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def initialize(self, config, core):
        self.config = config
        self.core = core

    def get_tidal_backend(self):
        try:
            from mopidy_tidal.backend import TidalBackend
        except ImportError:
            return None

        tidal_backend = None
        backends = self.core.backends.get()
        for backend in backends:
            if backend.actor_ref.actor_class == TidalBackend:
                tidal_backend = backend
        return tidal_backend.actor_ref._actor

    def get(self):
        backend = self.get_tidal_backend()

        playlist_uri = self.get_arguments("playlist_uri")
        track_uri = self.get_arguments("track_uri")
        if len(playlist_uri) == 0 or len(track_uri) == 0:
            self.set_status(400)
            self.finish("Error: needs playlist_uri and track_uri parameters")
        playlist_uri = playlist_uri[0]

        playlist_id = playlist_uri.split(":")[-1]
        track_ids = [uri.split(":")[-1] for uri in track_uri]

        upstream_playlist = backend.session.playlist(playlist_id)
        res = upstream_playlist.add(track_ids)
        backend.playlists._playlists.prune(playlist_uri)

        logger.info(f'Added {res} to playlist {playlist_id}')

        self.finish(
            f'Added {res} to playlist {playlist_id}'
        )


class GetLastFMData(tornado.web.RequestHandler):
    def set_default_headers(self):
        # TODO: reuse settings from mopidy HTTP ?
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def initialize(self, config, core):
        self.config = config
        self.core = core
        self.lastfm_client = pylast.LastFMNetwork(
            api_key=config["mowecl"]["lastfm_api_key"],
            api_secret=config["mowecl"]["lastfm_api_secret"]
        )

    def get(self):
        artist_name = self.get_arguments("artist_name")
        resp = self.lastfm_client.search_for_artist(artist_name)
        page = resp.get_next_page()
        first_result = page[0]
        bio = first_result.get_bio_content()
        name = first_result.get_name()
        listener_count = first_result.get_listener_count()
        result = {
            "bio": bio,
            "name": name,
            "listener_count": listener_count
        }
        self.finish(json.dumps(result))
