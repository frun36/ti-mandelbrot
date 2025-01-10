from flask import jsonify, request
from services.auth_guard import auth_guard


def init(app):

    @app.route('/api/save', methods=['POST'])
    @auth_guard
    def protected_route():
        json = request.get_json()

        print(json)

        return jsonify({"message": 'Saving', "view": json}), 200
