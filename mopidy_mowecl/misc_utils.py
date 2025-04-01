from functools import lru_cache
import logging

import musicbrainzngs
import pylast
import requests

logger = logging.getLogger(__name__)

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
        artist = None
        for result in page:
            if result.get_name().lower() == artist_name.lower():
                artist = result
                break
        else:
            artist = page[0]

        bio = artist.get_bio_content()
        name = artist.get_name()
        listener_count = artist.get_listener_count()
        return {
            "bio": bio,
            "name": name,
            "listener_count": listener_count,
            "url": artist.get_url()
        }


class MusicBrainzWrapper:
    def __init__(self):
        musicbrainzngs.set_useragent("mopidy_mowecl", "0.1", "https://github.com/sapristi/mopidy-mowecl")

    # TODO: add TTL on cache
    @lru_cache(maxsize=1000)
    def get_artist_data(self, artist_name):
        result = musicbrainzngs.search_artists(artist=artist_name)
        if len(result["artist-list"]) == 0:
            return None
        logger.info(f"Searched '{artist_name}', found artists: {[item['name'] for item in result['artist-list']]}")
        for artist in result["artist-list"]:
            if artist["name"].lower() == artist_name.lower():
                artist_id = artist["id"]
                break
        else:
            artist_id = result["artist-list"][0]["id"]

        artist_data = musicbrainzngs.get_artist_by_id(artist_id, includes=["url-rels"])["artist"]

        begin_area = artist_data.get("begin-area", {}).get("name")
        current_area = artist_data.get("area", {}).get("name")
        life_span = artist_data.get("life-span")

        wikidata_entry = next(
            (
            entry["target"] for entry in artist_data["url-relation-list"]
            if entry["type"] == "wikidata"
            ),
            None
        )
        wikipedia_url = None
        wikipedia_extract = None
        if wikidata_entry:
            wikidata_id = wikidata_entry.split("/")[-1]
            wikidata_data = requests.get(f"https://wikidata.org/w/rest.php/wikibase/v1/entities/items/{wikidata_id}").json()
            wikipedia_url = wikidata_data["sitelinks"].get("enwiki", {}).get("url")

            if wikipedia_url:
                wikipedia_title = wikipedia_url.split("/")[-1]
                wikipedia_extract_data = requests.get(f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles={wikipedia_title}&explaintext=1&exsectionformat=plain").json()
                wikipedia_extract = list(wikipedia_extract_data["query"]["pages"].values())[0]["extract"]

        return {
            "name": artist_data["name"],
            "type": artist_data["type"], # Person or Group
            "description": artist_data.get("disambiguation"),
            "begin_area": begin_area,
            "current_area": current_area,
            "wikipedia_url": wikipedia_url,
            "wikipedia_extract": wikipedia_extract,
            "life_span": life_span
        }

