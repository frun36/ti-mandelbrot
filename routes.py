from flask import jsonify, request, g
from jwt_utils import auth_guard, generate_jwt
import database as db


def init(app):
    @app.route('/api/login', methods=['POST'])
    def login():
        username = request.json.get("username")
        password = request.json.get("password")
        if not username or not password:
            return jsonify({"message": "Username or password missing"}), 400

        result = db.authenticate(username, password)[0]
        if not result:
            return jsonify({"message": "Invalid credentials"}), 400

        # JWT valid 10 minutes from now
        access_token = generate_jwt(payload=result, lifetime=10)
        return jsonify({"accessToken": access_token}), 200

    @app.route('/api/register', methods=['POST'])
    def register():
        username = request.json.get('username')
        password = request.json.get('password')
        if not username or not password:
            return jsonify({"message": "Username or password missing"}), 400

        try:
            row_count = db.register_user(username, password)
            if row_count == 1:
                return jsonify({"message": f"User '{username}' successfully registered"}), 200
            else:
                return jsonify({"message": f"Failed to register user '{username}': unexpected"}), 500
        except Exception as e:
            return jsonify({"message": f"Failed to register user '{username}': {str(e)}"}), 500

    @app.route("/api/snapshots", methods=['POST'])
    @auth_guard
    def save_snapshot():
        user_id = g.jwt_payload.get('user_id')
        json = request.get_json()

        name = json.get("name")
        zoom = json.get("zoom")
        x = json.get("x")
        y = json.get("y")
        thumb_base64 = json.get("thumb")

        if name is None or zoom is None or x is None or y is None or thumb_base64 is None:
            return jsonify({"message": f"Incomplete snapshot data"}), 400

        try:
            rows_updated = db.save_snapshot(
                user_id, name, zoom, x, y, thumb_base64)

            if rows_updated == 1:
                return jsonify({"message": f"Snapshot '{name}' saved successfully"}), 200
            else:
                return jsonify({"message": f"Failed to save snapshot '{name}': unexpected"}), 500
        except Exception as e:
            return jsonify({"message": f"Failed to save snapshot '{name}': {str(e)}"}), 500

    @app.route("/api/snapshots/<int:snapshot_id>", methods=['DELETE'])
    @auth_guard
    def delete_snapshot(snapshot_id):
        user_id = g.jwt_payload.get('user_id')

        try:
            snapshot = db.get_snapshot_by_id(snapshot_id)
            if snapshot is None:
                return jsonify({"message": f"Snapshot ID {snapshot_id} not found"}), 404

            if snapshot['user_id'] != user_id:
                return jsonify({"message": f"You are not authorized to delete snapshot ID {snapshot_id}"}), 403

            rows_deleted = db.delete_snapshot(snapshot_id)

            if rows_deleted == 1:
                return jsonify({"message": f"Snapshot ID {snapshot_id} deleted successfully"}), 200
            else:
                return jsonify({"message": f"Failed to delete snapshot ID {snapshot_id}: unexpected error"}), 500
        except Exception as e:
            return jsonify({"message": f"Failed to delete snapshot ID {snapshot_id}: {str(e)}"}), 500

    @app.route("/api/users", methods=['GET'])
    def all_users():
        try:
            result = db.get_all_users()

            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @app.route("/api/snapshots")
    def all_snapshots():
        try:
            result = db.get_all_snapshots()
            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    @app.route("/api/snapshots/<int:user_id>")
    def user_snapshots(user_id):
        try:
            result = db.get_user_snapshots(user_id)
            return jsonify(result)
        except Exception as e:
            return jsonify({"message": str(e)}), 500
