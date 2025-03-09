import logging
import pathlib
import pkg_resources
import sysconfig
import re

from mopidy import config, ext

from tornado.web import StaticFileHandler
from .file_server import FileServer
from .web_api_extra  import AddToPlaylistRequestHandler

__version__ = pkg_resources.get_distribution("Mopidy-Mowecl").version

logger = logging.getLogger(__name__)


class ConfigColor(config.String):

    def deserialize(self, value):
        value = super().deserialize(value)
        if not re.fullmatch("#[0-9A-Fa-f]{6}", value):
            raise ValueError(f"Colors must be in the #AAAAAA format; {value} is not")
        return value


class Extension(ext.Extension):

    dist_name = "Mopidy-Mowecl"
    ext_name = "mowecl"
    version = __version__

    def get_default_config(self):
        return config.read(pathlib.Path(__file__).parent / "ext.conf")

    def get_config_schema(self):
        schema = super().get_config_schema()
        schema["theme_type"] = config.String(optional=True, choices=["light", "dark"])
        schema["background_color"] = ConfigColor(optional=True)
        schema["text_color"] = ConfigColor(optional=True)
        schema["primary_color"] = ConfigColor(optional=True)
        schema["seek_update_interval"] = config.Integer()
        schema["search_history_length"] = config.Integer()
        schema["disable_dnd"] = config.Boolean()
        schema["small_screen"] = config.Boolean()

        schema["key_play_pause"] = config.String(optional=True)
        schema["key_next_track"] = config.String(optional=True)
        schema["key_previous_track"] = config.String(optional=True)
        schema["key_rewind_track"] = config.String(optional=True)
        schema["key_volume_up"] = config.String(optional=True)
        schema["key_volume_down"] = config.String(optional=True)
        return schema

    def setup(self, registry):

        logger.info("VERSION %s", self.version)
        registry.add(
            "http:app",
            {
                "name": self.ext_name,
                "factory": self.factory
            },
        )

    def factory(self, config, core):
        root = pathlib.Path(sysconfig.get_path("data")) / "mopidy_mowecl" / "static"
        server_params = {
            "path": root, "config": config, "mowecl_version": self.version
        }
        return [
            (r"/(index.html)", server_params),
            (r"/", FileServer, server_params),
            (r"/(.*)", StaticFileHandler, {"path": root}),
            ('/add_to_playlist', AddToPlaylistRequestHandler, {'config': config, 'core': core}),
        ]
