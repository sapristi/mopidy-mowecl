from functools import lru_cache

import pylast


class LastFMWrapper:
    def __init__(self, api_key, api_secret):
        self.client = pylast.LastFMNetwork(
            api_key=api_key,
            api_secret=api_secret
        )

    # TODO: add TTL on cache
    @lru_cache(maxsize=1000)
    def get_artist_data(self, artist_name):
        resp = self.client.search_for_artist(artist_name)
        page = resp.get_next_page()
        artist = page[0] # only considering first result for now
        bio = artist.get_bio_content()
        name = artist.get_name()
        listener_count = artist.get_listener_count()
        return {
            "bio": bio,
            "name": name,
            "listener_count": listener_count,
            "url": artist.get_url()
        }
