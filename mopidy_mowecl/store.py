import os
import sqlite3
import json
import logging

logger = logging.getLogger(__name__)

def initialize(data_dir):
    conn = sqlite3.connect(os.path.join(data_dir, 'bookmarks.db'))
    c = conn.cursor()
    try:
        c.execute("CREATE TABLE store (key text, data text)")
        c.execute("""CREATE TABLE bookmark (
        name text,
        current_track int,
        current_time int,
        tracks text
        )""")
    except sqlite3.OperationalError:
        pass

def _key_exists(conn, key):
    c = conn.cursor()
    c.execute("select * from store where key=?", (key,))
    return len(c.fetchall()) > 0

def save(data_dir, key, data):
    conn = sqlite3.connect(os.path.join(data_dir, 'bookmarks.db'))
    c = conn.cursor()
    if _key_exists(conn, key):
        c.execute("update store set data=? where key=?",
                  (data, key))
    else:
        c.execute("insert into store (key, data) values (?, ?)",
                  (key, data))
    conn.commit()

def load(data_dir, key):
    conn = sqlite3.connect(os.path.join(data_dir, 'bookmarks.db'))
    if _key_exists(conn, key):
        c = conn.cursor()
        c.execute("select data from store where key=?", (key,))
        return c.fetchone()[0]
    else:
        return b"null"

def _bookmark_exists(conn, name):
    c = conn.cursor()
    c.execute("select * from bookmark where name=?", (name,))
    return len(c.fetchall()) > 0

def save_bookmark(conn, name, track_uris, current_track, current_time):
    uris_str = json.dumps(track_uris)
    c = conn.cursor()
    if _bookmark_exists(conn, name):
        c.execute("""update bookmark
        set tracks=?, current_track=?, current_time=?
        where name=?""",
        (uris_str, current_track, current_time, name))
    else:
        c.execute("""insert into bookmark
        (name, tracks, current_track, current_time) values (?, ?, ?, ?)""",
        (name, uris_str, current_track, current_time))
    conn.commit()

def load_bookmark(conn, name):
    c = conn.cursor()
    if _bookmark_exists(conn, name):
        c.execute("select * from bookmark where name=?", (name,))
        res = c.fetchone()
    else:
        return None
