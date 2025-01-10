from functools import wraps
from flask import request, jsonify
from services.jwt_handler import decode_jwt


def check_jwt():
    # Gets token from request header and tries to get its payload
    # Will raise errors if token is missing, invalid or expired
    token = request.headers.get('Authorization')
    if not token:
        raise Exception('Missing access token')
    jwt = token.split('Bearer ')[1]
    try:
        return decode_jwt(jwt)
    except Exception as e:
        raise Exception(f'Invalid access token: {e}')


def auth_guard(route_function):
    @wraps(route_function)
    def f(*args, **kwargs):
        # Authentication gate
        try:
            check_jwt()
        except Exception as e:
            return jsonify({"message": f'{e}'}), 401

        return route_function(*args, **kwargs)
    return f
