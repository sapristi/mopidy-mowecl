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
        first_result = page[0]
        bio = first_result.get_bio_content()
        name = first_result.get_name()
        listener_count = first_result.get_listener_count()
        return {
            "bio": bio,
            "name": name,
            "listener_count": listener_count
        }
