DROP TABLE IF EXISTS snapshot;

DROP TABLE IF EXISTS user;

CREATE TABLE
    user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );

CREATE TABLE
    snapshot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        zoom DOUBLE NOT NULL,
        x DOUBLE NOT NULL,
        y DOUBLE NOT NULL,
        thumb_base64 TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user (id)
    );