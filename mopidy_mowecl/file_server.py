import tornado.web
import logging

logger = logging.getLogger(__name__)

def sanitize_config(config):
    def sanitize_param(p):
        return p if p else ""
    return {k: sanitize_param(v) for k, v in config.items()}

class FileServer(tornado.web.RequestHandler):
    def initialize(self, config, path):
        self.config = config
        self.path = path

    def get(self, path=None):
        config_sanitized = sanitize_config(self.config["mowecl"])
        template_params = {
            **config_sanitized,
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
