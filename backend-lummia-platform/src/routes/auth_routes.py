from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import (
    auth_required, verify_password, hash_password, create_token,
)
from src.utils.i18n import t

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = execute_pg_one(
        """SELECT u.id, u.username, u.email, u.password_hash, u.role,
                  u.expbara, u.level, u.must_change_password, u.is_active,
                  u.clan_id, u.cohort_id,
                  c.name as clan_name, co.name as cohort_name
           FROM users u
           LEFT JOIN clans c ON u.clan_id = c.id
           LEFT JOIN cohorts co ON u.cohort_id = co.id
           WHERE u.email = %s""",
        (email,),
    )
    if not user:
        return jsonify({"error": "No account found with this email"}), 401

    if not verify_password(password, user["password_hash"]):
        return jsonify({"error": "Incorrect password"}), 401

    if not user["is_active"]:
        return jsonify({"error": "Account disabled"}), 403

    token = create_token(user["id"])

    # Get rank info
    rank = execute_pg_one(
        "SELECT name, icon_url FROM ranks WHERE min_expbara <= %s ORDER BY min_expbara DESC LIMIT 1",
        (user["expbara"],),
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "expbara": user["expbara"],
            "level": user["level"],
            "rank_name": rank["name"] if rank else "Aprendiz",
            "rank_icon": rank["icon_url"] if rank else None,
            "clan_id": user["clan_id"],
            "clan_name": user["clan_name"],
            "cohort_id": user["cohort_id"],
            "cohort_name": user["cohort_name"],
            "must_change_password": user["must_change_password"],
        },
    }), 200


@auth_bp.route("/me", methods=["GET"])
@auth_required
def me():
    u = g.current_user
    rank = execute_pg_one(
        "SELECT name, icon_url FROM ranks WHERE min_expbara <= %s ORDER BY min_expbara DESC LIMIT 1",
        (u["expbara"],),
    )
    u["rank_name"] = rank["name"] if rank else "Aprendiz"
    u["rank_icon"] = rank["icon_url"] if rank else None
    return jsonify(u), 200


@auth_bp.route("/profile", methods=["PUT"])
@auth_required
def update_profile():
    data = request.json or {}
    fields, values = [], []

    if "username" in data:
        username = data["username"].strip()
        if not username:
            return jsonify({"error": "Username cannot be empty"}), 400
        fields.append("username = %s")
        values.append(username)
    if "bio" in data:
        fields.append("bio = %s")
        values.append(data["bio"])

    if not fields:
        return jsonify({"error": "No fields to update"}), 400

    values.append(g.current_user["id"])
    try:
        execute_pg(
            f"UPDATE users SET {', '.join(fields)} WHERE id = %s",
            values,
            fetch=False,
        )
    except Exception as e:
        if "duplicate" in str(e).lower():
            return jsonify({"error": "Username already taken"}), 409
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Profile updated"}), 200


@auth_bp.route("/change-password", methods=["POST"])
@auth_required
def change_password():
    data = request.json or {}
    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not current_password:
        return jsonify({"error": "current_password required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if new_password != confirm_password:
        return jsonify({"error": "new_password and confirm_password do not match"}), 400

    # Verify current password
    user = execute_pg_one(
        "SELECT password_hash FROM users WHERE id = %s",
        (g.current_user["id"],),
    )
    if not user or not verify_password(current_password, user["password_hash"]):
        return jsonify({"error": "Current password is incorrect"}), 401

    hashed = hash_password(new_password)
    execute_pg_one(
        "UPDATE users SET password_hash = %s, must_change_password = FALSE WHERE id = %s RETURNING id",
        (hashed, g.current_user["id"]),
    )
    return jsonify({"message": t("password_changed", g.current_user.get("preferred_lang", "es"))}), 200


# -- Public user profile (for leaderboard click-through) --

@users_bp.route("/<int:user_id>/profile", methods=["GET"])
@auth_required
def public_profile(user_id):
    user = execute_pg_one(
        """SELECT u.id, u.username, u.email, u.bio, u.role, u.expbara, u.level, u.created_at,
                  c.name as clan_name, co.name as cohort_name
           FROM users u
           LEFT JOIN clans c ON u.clan_id = c.id
           LEFT JOIN cohorts co ON u.cohort_id = co.id
           WHERE u.id = %s""",
        (user_id,),
    )
    if not user:
        return jsonify({"error": "User not found"}), 404

    rank = execute_pg_one(
        "SELECT name, icon_url FROM ranks WHERE min_expbara <= %s ORDER BY min_expbara DESC LIMIT 1",
        (user["expbara"],),
    )
    profile = dict(user)
    profile["rank_name"] = rank["name"] if rank else "Aprendiz"
    profile["rank_icon"] = rank["icon_url"] if rank else None

    # Count unlocked achievements
    achievement_count = execute_pg_one(
        "SELECT COUNT(*) as cnt FROM user_achievements WHERE user_id = %s",
        (user_id,),
    )
    profile["achievement_count"] = achievement_count["cnt"] if achievement_count else 0

    return jsonify(profile), 200
