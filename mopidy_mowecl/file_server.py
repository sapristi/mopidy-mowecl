import tornado.web
import logging

logger = logging.getLogger(__name__)

class FileServer(tornado.web.RequestHandler):
    def initialize(self, config, path):

        self.config = config
        self.path = path

    def get(self, path=None):
        template_params = {
            **self.config["mowecl"],
            "static_settings_enabled": "true"
        }
        return self.render("index.html", title="Mowecl", **template_params)

    def get_title(self):
        url = urllib.parse.urlparse(
            f"{self.request.protocol}://{self.request.host}"
        )
        return self.__title.safe_substitute(hostname=url.hostname)

    def get_template_path(self):
        return self.path
