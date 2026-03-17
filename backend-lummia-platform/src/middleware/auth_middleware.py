import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request, jsonify, g
from src.config.env import Config
from src.config.database import execute_pg_one
import bcrypt


def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password, hashed):
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id):
    payload = {
        "sub": str(user_id),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)


def decode_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return int(payload["sub"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token required"}), 401

        user_id = decode_token(token)
        if not user_id:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = execute_pg_one(
            """SELECT id, username, email, role, expbara, level, bio, clan_id,
                      cohort_id, must_change_password, is_active, preferred_lang
               FROM users WHERE id = %s AND is_active = TRUE""",
            (user_id,),
        )
        if not user:
            return jsonify({"error": "User not found"}), 401

        g.current_user = dict(user)
        return f(*args, **kwargs)

    return decorated


def role_required(roles):
    def decorator(f):
        @wraps(f)
        @auth_required
        def decorated(*args, **kwargs):
            if g.current_user["role"] not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)

        return decorated

    return decorator