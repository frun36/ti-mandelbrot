import sqlite3

DB_PATH = "database/data.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def query(sql, *args):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(sql, *args)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def update(sql, *args):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, *args)
        conn.commit()
        row_count = cursor.rowcount
        conn.close()
        return row_count
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e


def get_all_users():
    return query(
        """
        SELECT u.id, u.username, count(s.id) as snapshot_count
        FROM user u 
            LEFT JOIN snapshot s ON u.id = s.user_id
        GROUP BY u.id
        """)


def get_all_snapshots():
    return query(
        """
        SELECT s.id as snapshot_id, u.id as user_id, u.username, s.name, s.zoom, s.x, s.y, s.thumb_base64
        FROM snapshot s
            JOIN user u ON s.user_id = u.id
        """)


def get_user_snapshots(user_id):
    return query(
        """
        SELECT s.id as snapshot_id, u.id as user_id, u.username, s.name, s.zoom, s.x, s.y, s.thumb_base64
        FROM snapshot s
            JOIN user u ON s.user_id = u.id
        WHERE s.user_id = ?
        """, (user_id,))


def register_user(username, password):
    return update(
        """
        INSERT INTO user (username, password) VALUES (?, ?)
        """, (username, password))


def authenticate(username, password):
    return query(
        """
        SELECT id as user_id FROM user WHERE username = ? AND password = ?
        """, (username, password))


def save_snapshot(user_id, name, zoom, x, y, thumb_base64):
    return update(
        """
        INSERT INTO snapshot (user_id, name, zoom, x, y, thumb_base64) 
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, name, zoom, x, y, thumb_base64))


def get_snapshot_by_id(snapshot_id):
    result = query("SELECT * FROM snapshot WHERE id = ?", (snapshot_id,))
    return result[0] if result else None


def delete_snapshot(snapshot_id):
    return update("DELETE FROM snapshot WHERE id = ?", (snapshot_id,))
