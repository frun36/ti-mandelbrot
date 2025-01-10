from flask import request, jsonify
from services.auth_provider import authenticate
from services.jwt_handler import generate_jwt


def init(app):

    @app.route('/api/auth', methods=['POST'])
    def auth():
        username = request.json.get('username')
        password = request.json.get('password')
        if not username or not password:
            return jsonify({"message": "Username or password missing"}), 400

        user_data = authenticate(username, password)
        if not user_data:
            return jsonify({"message": "Invalid credentials"}), 400

        # JWT valid 1 minute from now
        token = generate_jwt(payload=user_data, lifetime=1)
        return jsonify({"data": token}), 200
