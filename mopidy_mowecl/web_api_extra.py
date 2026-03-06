import logging
import json
import tornado.web
import musicbrainzngs

logger = logging.getLogger(__name__)


class AddToPlaylistRequestHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        # TODO: reuse settings from mopidy HTTP ?
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

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

        logger.info(f"Added {res} to playlist {playlist_id}")

        self.finish(f"Added {res} to playlist {playlist_id}")


class GetLastFMData(tornado.web.RequestHandler):
    def set_default_headers(self):
        # TODO: reuse settings from mopidy HTTP ?
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

    def initialize(self, last_fm_wrapper):
        self.last_fm_wrapper = last_fm_wrapper

    def get(self):
        artist_name = self.get_arguments("artist_name")[0]
        result = self.last_fm_wrapper.get_artist_data(artist_name)
        self.finish(json.dumps(result))


class GetMusicBrainzData(tornado.web.RequestHandler):
    def set_default_headers(self):
        # TODO: reuse settings from mopidy HTTP ?
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

    def initialize(self, musicbrainz_wrapper):
        self.musicbrainz_wrapper = musicbrainz_wrapper

    def get(self):
        artist_name = self.get_arguments("artist_name")[0]
        result = self.musicbrainz_wrapper.get_artist_data(artist_name)
        self.finish(json.dumps(result))


class TidalFavoriteArtistHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header(
            "Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS"
        )

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

    def _get_artist_id(self):
        artist_uri = self.get_arguments("artist_uri")
        if len(artist_uri) == 0:
            self.set_status(400)
            self.finish("Error: needs artist_uri parameter")
            return None
        return artist_uri[0].split(":")[-1]

    def get(self):
        backend = self.get_tidal_backend()
        if backend is None:
            self.set_status(503)
            self.finish(json.dumps({"error": "Tidal backend not available"}))
            return
        artist_id = self._get_artist_id()
        if artist_id is None:
            return
        favorites = backend.session.user.favorites
        fav_artist_ids = [str(a.id) for a in favorites.artists()]
        is_favorite = str(artist_id) in fav_artist_ids
        self.finish(json.dumps({"is_favorite": is_favorite}))

    def post(self):
        backend = self.get_tidal_backend()
        if backend is None:
            self.set_status(503)
            self.finish(json.dumps({"error": "Tidal backend not available"}))
            return
        artist_id = self._get_artist_id()
        if artist_id is None:
            return
        backend.session.user.favorites.add_artist(artist_id)
        logger.info(f"Added artist {artist_id} to Tidal favorites")
        self.finish(json.dumps({"ok": True}))

    def delete(self):
        backend = self.get_tidal_backend()
        if backend is None:
            self.set_status(503)
            self.finish(json.dumps({"error": "Tidal backend not available"}))
            return
        artist_id = self._get_artist_id()
        if artist_id is None:
            return
        backend.session.user.favorites.remove_artist(artist_id)
        logger.info(f"Removed artist {artist_id} from Tidal favorites")
        self.finish(json.dumps({"ok": True}))

    def options(self):
        self.set_status(204)
        self.finish()


class TidalFavoriteArtistsHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header("Access-Control-Allow-Methods", "GET, OPTIONS")

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
        if backend is None:
            self.set_status(503)
            self.finish(
                json.dumps(
                    {"error": "Tidal backend not available"}
                )
            )
            return
        favorites = backend.session.user.favorites
        fav_artist_ids = [
            str(a.id) for a in favorites.artists()
        ]
        self.finish(
            json.dumps(
                {"favorite_artist_ids": fav_artist_ids}
            )
        )

    def options(self):
        self.set_status(204)
        self.finish()


class TracklistHistoryHandler(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header(
            "Access-Control-Allow-Headers", "x-requested-with"
        )
        self.set_header(
            "Access-Control-Allow-Methods", "GET, OPTIONS"
        )

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
        self.set_header(
            "Access-Control-Allow-Headers", "x-requested-with"
        )
        self.set_header(
            "Access-Control-Allow-Methods", "POST, OPTIONS"
        )

    def initialize(self, history_actor):
        self.history_actor = history_actor

    def post(self):
        direction = self.get_argument("direction")
        if direction not in ("back", "forward"):
            self.set_status(400)
            self.finish(
                json.dumps(
                    {
                        "error": "direction must be"
                        " 'back' or 'forward'"
                    }
                )
            )
            return
        info = self.history_actor.restore(direction).get()
        self.finish(json.dumps(info))

    def options(self):
        self.set_status(204)
        self.finish()
