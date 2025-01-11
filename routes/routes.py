from flask import jsonify, request
from services.auth_guard import auth_guard
from services.database import get_db, query


def init(app):

    @app.route("/api/save", methods=['POST'])
    @auth_guard
    def protected_route():
        json = request.get_json()

        print(json)

        return jsonify({"message": 'Saving', "snapshot": json}), 200

    @app.route("/api/users", methods=['GET'])
    def users():
        try:
            result = query(
                """
                SELECT u.id, u.username, count( s.id) as snapshot_count
                FROM user u 
                    LEFT JOIN snapshot s ON u.id = s.user_id
                GROUP BY u.id
                """)

            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @app.route("/api/snapshots")
    def all_snapshots():
        try:
            result = query(
                """
                SELECT s.id, u.id, u.username, s.name, s.zoom, s.x, s.y, s.thumb_base64
                FROM snapshot s
                    JOIN user u ON s.user_id = u.id
                """)
            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @app.route("/api/snapshots/<int:user_id>")
    def snapshots(user_id):
        try:
            result = query(
                """
                SELECT s.id, u.id, u.username, s.name, s.zoom, s.x, s.y, s.thumb_base64
                FROM snapshot s
                    JOIN user u ON s.user_id = u.id
                WHERE s.user_id = ?
                """, (user_id,))
            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500
