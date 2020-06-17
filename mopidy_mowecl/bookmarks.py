import pykka
import logging
import functools
import json

import tornado.websocket
from mopidy.core import CoreListener, PlaybackController

# import logger
logger = logging.getLogger(__name__)

class Core(pykka.ThreadingActor):

    def __init__(self):
        super().__init__()
        logger.info("Core starting")
        self.ws = None
        self.mopidy_core = None
        self.mopidy_listener = None

    def setup_ws_handler(self, wsHandler):
        self.ws = wsHandler

    def setup_mopidy_core(self, mopidy_core):
        self.mopidy_core = mopidy_core

    def setup_mopidy_listener(self, mopidy_listener):
        self.mopidy_listener = mopidy_listener

    def create_bookmark(self, bookmark_name):
        tltracks = self.mopidy_core.tracklist.get_tl_tracks().get()
        tracks = [tlt.track for tlt in tltracks]
        track_uris = [t.uri for t in tracks]
        logger.info("Creating bookmark %s from %s", bookmark_name, track_uris)
        pass

    def resume_bookmark(self, bookmark_name):
        self.mopidy_core.tracklist.clear()
        pass

    def stop_sync(self):
        current_time = self.mopidy_core.playback.get_time_position().get()
        logger.info("Current time is %s", current_time)

bookmarks_core = Core.start().proxy()

class MopidyCoreListener(pykka.ThreadingActor, CoreListener):
    def __init__(self, config, core):
        super().__init__()
        logger.info('INIT (%s)', bookmarks_core)
        bookmarks_core.setup_mopidy_listener(self)
        bookmarks_core.setup_mopidy_core(core)

    def on_start(self):
        logger.info('STARTING')

    def on_stop(self):
        logger.info('STOPPING')

    def track_playback_ended(self, tl_track, time_position):
        logger.info('track ended')

    def tracklist_changed(self):
        logger.info('tracklist changed')

    def playback_state_changed(self, old_state, new_state):
        logger.info("new state: %s -> %s", old_state, new_state)


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def initialize(self):
        logger.info("WS INITIALISE (%s)", bookmarks_core )
        bookmarks_core.setup_ws_handler(self)

    def open(self):
        logger.info("WS OPEN")

    def on_message(self, message):
        logger.info("WS RECEIVED %s", message)
        message_payload = json.loads(message)
        for k, v in message_payload.items():
            logger.info("Exec %s (%s)", k, v)
            getattr(bookmarks_core, k)(**v)

    def check_origin(self, origin):
        return True

