from datetime import datetime, timedelta
from dotenv import load_dotenv
from flask import request, jsonify, g
from functools import wraps
import jwt
import os

load_dotenv()


def generate_jwt(payload, lifetime=None):
    # Lifetime - minutes
    if lifetime:
        payload['exp'] = (
            datetime.now() + timedelta(minutes=lifetime)).timestamp()
    return jwt.encode(payload, os.environ.get('SECRET_KEY'), algorithm="HS256")


def decode_jwt(token):
    return jwt.decode(token, os.environ.get('SECRET_KEY'), algorithms=["HS256"])


def extract_jwt():
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
        try:
            g.jwt_payload = extract_jwt()
        except Exception as e:
            return jsonify({"message": f'{str(e)}'}), 401

        return route_function(*args, **kwargs)
    return f
