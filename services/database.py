import sqlite3

DB_PATH = "database/data.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

    
def query(*args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(*args)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]