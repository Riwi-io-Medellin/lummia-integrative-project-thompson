from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import auth_required, role_required

achievement_bp = Blueprint("achievements", __name__, url_prefix="/api")


@achievement_bp.route("/achievements", methods=["GET"])
@auth_required
def list_achievements():
    rows = execute_pg(
        """SELECT id, name, description, icon_url, criteria,
                  threshold, created_at
           FROM achievements ORDER BY id"""
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@achievement_bp.route("/achievements/me", methods=["GET"])
@auth_required
def my_achievements():
    rows = execute_pg(
        """SELECT a.id, a.name, a.description, a.icon_url,
                  a.criteria, a.threshold,
                  ua.created_at
           FROM user_achievements ua
           JOIN achievements a ON ua.achievement_id = a.id
           WHERE ua.user_id = %s
           ORDER BY ua.created_at DESC""",
        (g.current_user["id"],),
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@achievement_bp.route("/admin/achievements/grant", methods=["POST"])
@role_required(["super_admin"])
def grant_achievement():
    data = request.json or {}
    user_id = data.get("user_id")
    achievement_id = data.get("achievement_id")

    if not user_id or not achievement_id:
        return jsonify({"error": "user_id and achievement_id required"}), 400

    # Check if the achievement exists
    achievement = execute_pg_one(
        "SELECT id, name FROM achievements WHERE id = %s", (achievement_id,)
    )
    if not achievement:
        return jsonify({"error": "Achievement not found"}), 404

    # Check if the user exists
    user = execute_pg_one(
        "SELECT id FROM users WHERE id = %s AND is_active = TRUE", (user_id,)
    )
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if already granted
    existing = execute_pg_one(
        "SELECT id FROM user_achievements WHERE user_id = %s AND achievement_id = %s",
        (user_id, achievement_id),
    )
    if existing:
        return jsonify({"error": "Achievement already granted to this user"}), 409

    row = execute_pg_insert(
        """INSERT INTO user_achievements (user_id, achievement_id)
           VALUES (%s, %s) RETURNING id, user_id, achievement_id, created_at""",
        (user_id, achievement_id),
    )
    return jsonify({
        "message": "Achievement granted",
        "data": dict(row),
    }), 201