import logging
import pathlib
import json
import pkg_resources

from mopidy import config, ext

from tornado.web import RequestHandler
from . import store
from . import bookmarks


__version__ = pkg_resources.get_distribution("Mopidy-Mowecl").version

logger = logging.getLogger(__name__)


class ApiHandler(RequestHandler):
    keys = ["settings"]

    def check_request(self, arg, request):
        return arg in self.keys and len(request.body) < 10000

    def initialize(self, data_dir, allowed_origins):
        self.data_dir = data_dir
        self.allowed_origins = allowed_origins

    def get(self, arg):
        self.set_header("Access-Control-Allow-Origin", "*")
        res = store.load(self.data_dir, arg)
        self.write(res)

    def post(self, arg):
        self.set_header("Access-Control-Allow-Origin", "*")
        req = self.request
        if check_request(arg, req):
            store.save(self.data_dir, "settings", req.body)

class Extension(ext.Extension):

    dist_name = "Mopidy-Mowecl"
    ext_name = "mowecl"
    version = __version__

    def get_default_config(self):
        return config.read(pathlib.Path(__file__).parent / "ext.conf")

    def get_config_schema(self):
        schema = super().get_config_schema()
        return schema

    def setup(self, registry):

        registry.add(
            "http:static",
            {
                "name": self.ext_name,
                "path": str(pathlib.Path(__file__).parent / "static"),
            },
        )
        registry.add(
            "http:app", {
                "name": self.ext_name,
                "factory": self.http_app_factory}
        )
        registry.add("frontend", bookmarks.MopidyCoreListener)


    def http_app_factory(self, config, core):
        allowed_origins = {
            x.lower() for x in config["http"]["allowed_origins"] if x
        }

        store.initialize(self.get_data_dir(config))
        return [
            (
                r"/api/(.*)",
                ApiHandler,
                {"data_dir": self.get_data_dir(config),
                 "allowed_origins": allowed_origins}
            ),
            (
                r"/ws/?", bookmarks.WebSocketHandler, {}
            )
        ]

