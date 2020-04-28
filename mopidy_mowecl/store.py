import os
import sqlite3

import logging

logger = logging.getLogger(__name__)

def initialize(data_dir):
    conn = sqlite3.connect(os.path.join(data_dir, 'mowecl.db'))
    c = conn.cursor()
    try:
        c.execute("CREATE TABLE mowecl (key text, data text)")
    except sqlite3.OperationalError:
        pass


def _key_exists(conn, key):
    c = conn.cursor()
    c.execute("select * from mowecl where key=?", (key,))
    return len(c.fetchall()) > 0

def save(data_dir, key, data):
    conn = sqlite3.connect(os.path.join(data_dir, 'mowecl.db'))
    c = conn.cursor()
    if _key_exists(conn, key):
        c.execute("update mowecl set data=? where key=?",
                  (data, key))
    else:
        c.execute("insert into mowecl (key, data) values (?, ?)",
                  (key, data))
    conn.commit()

def load(data_dir, key):
    conn = sqlite3.connect(os.path.join(data_dir, 'mowecl.db'))
    if _key_exists(conn, key):
        c = conn.cursor()
        c.execute("select data from mowecl where key=?", (key,))
        return c.fetchone()[0]
    else:
        return b"null"
