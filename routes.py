from datetime import datetime, timedelta, timezone
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import (create_access_token, create_refresh_token, get_jwt, get_jwt_identity,
                                jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies)
import database as db


def init(app):
    @app.route('/<path:filename>')
    def static_files(filename):
        return send_from_directory(app.static_folder, filename)

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.after_request
    def set_headers(response):
        # Requred for WASM threads
        response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
        response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
        return response

    @app.after_request
    def refresh_expiring_jwts(response):
        try:
            exp_timestamp = get_jwt()["exp"]
            now = datetime.now(timezone.utc)
            target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
            if target_timestamp > exp_timestamp:
                access_token = create_access_token(identity=get_jwt_identity())
                set_access_cookies(response, access_token)
            return response
        except (RuntimeError, KeyError):
            # Case where there is not a valid JWT. Just return the original response
            return response

    @app.route('/token/auth', methods=['POST'])
    def login():
        username = request.json.get("username")
        password = request.json.get("password")
        if not username or not password:
            return jsonify({"msg": "Username or password missing"}), 400

        result = db.authenticate(username, password)[0]
        if not result:
            return jsonify({"msg": "Invalid credentials"}), 401

        access_token = create_access_token(identity=str(result['user_id']))
        refresh_token = create_refresh_token(identity=str(result['user_id']))

        resp = jsonify({"msg": "Logged in successfully"})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)

        return resp, 200

    @app.route('/token/remove', methods=['POST'])
    def logout():
        resp = jsonify({"msg": "Logged out successfully"})
        unset_jwt_cookies(resp)
        return resp, 200

    @app.route('/api/register', methods=['POST'])
    def register():
        username = request.json.get('username')
        password = request.json.get('password')
        if not username or not password:
            return jsonify({"msg": "Username or password missing"}), 400

        try:
            row_count = db.register_user(username, password)
            if row_count == 1:
                return jsonify({"msg": f"User '{username}' successfully registered"}), 200
            else:
                return jsonify({"msg": f"Failed to register user '{username}': unexpected"}), 500
        except Exception as e:
            return jsonify({"msg": f"Failed to register user '{username}': {str(e)}"}), 500

    @app.route("/api/users/me", methods=['GET'])
    @jwt_required(optional=True)
    def user():
        try:
            user_id = get_jwt_identity()

            if user_id is None:
                return jsonify(None), 200

            result = db.get_user_by_id(user_id)

            return jsonify(result), 200
        except Exception as e:
            return jsonify({"msg": str(e)}), 500
        
    @app.route("/api/users", methods=['GET'])
    def all_users():
        try:
            result = db.get_all_users()

            return jsonify(result)
        except Exception as e:
            return jsonify({"msg": str(e)}), 500

    @app.route("/api/snapshots", methods=['POST'])
    @jwt_required()
    def save_snapshot():
        user_id = get_jwt_identity()
        json = request.get_json()

        name = json.get("name")
        zoom = json.get("zoom")
        x = json.get("x")
        y = json.get("y")
        thumb_base64 = json.get("thumb")

        if name is None or zoom is None or x is None or y is None or thumb_base64 is None:
            return jsonify({"msg": f"Incomplete snapshot data"}), 400

        try:
            rows_updated = db.save_snapshot(
                user_id, name, zoom, x, y, thumb_base64)

            if rows_updated == 1:
                return jsonify({"msg": f"Snapshot '{name}' saved successfully"}), 200
            else:
                return jsonify({"msg": f"Failed to save snapshot '{name}': unexpected"}), 500
        except Exception as e:
            return jsonify({"msg": f"Failed to save snapshot '{name}': {str(e)}"}), 500

    @app.route("/api/snapshots/<int:snapshot_id>", methods=['DELETE'])
    @jwt_required()
    def delete_snapshot(snapshot_id):
        user_id = get_jwt_identity()

        try:
            snapshot = db.get_snapshot_by_id(snapshot_id)
            if snapshot is None:
                return jsonify({"msg": f"Snapshot ID {snapshot_id} not found"}), 404

            if snapshot['user_id'] != int(user_id):
                return jsonify({"msg": f"You are not authorized to delete snapshot ID {snapshot_id}"}), 403

            rows_deleted = db.delete_snapshot(snapshot_id)

            if rows_deleted == 1:
                return jsonify({"msg": f"Snapshot ID {snapshot_id} deleted successfully"}), 200
            else:
                return jsonify({"msg": f"Failed to delete snapshot ID {snapshot_id}: unexpected error"}), 500
        except Exception as e:
            return jsonify({"msg": f"Failed to delete snapshot ID {snapshot_id}: {str(e)}"}), 500

    @app.route("/api/snapshots")
    def all_snapshots():
        try:
            result = db.get_all_snapshots()
            return jsonify(result)
        except Exception as e:
            return jsonify({"msg": str(e)}), 500

    @app.route("/api/snapshots/<int:user_id>")
    def user_snapshots(user_id):
        try:
            result = db.get_user_snapshots(user_id)
            return jsonify(result)
        except Exception as e:
            return jsonify({"msg": str(e)}), 500
