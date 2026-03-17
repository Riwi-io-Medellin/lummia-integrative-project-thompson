from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one
from src.middleware.auth_middleware import auth_required
from src.services.gamification_service import award_xp

gamification_bp = Blueprint("gamification", __name__, url_prefix="/api")


@gamification_bp.route("/leaderboard/users", methods=["GET"])
@auth_required
def user_leaderboard():
    rows = execute_pg(
        """SELECT u.id, u.username, u.expbara, u.level, u.role,
                  c.name as clan_name, r.name as rank_name, r.icon_url as rank_icon
           FROM users u
           LEFT JOIN clans c ON u.clan_id = c.id
           LEFT JOIN LATERAL (
               SELECT name, icon_url FROM ranks WHERE min_expbara <= u.expbara
               ORDER BY min_expbara DESC LIMIT 1
           ) r ON TRUE
           WHERE u.is_active = TRUE
           ORDER BY u.expbara DESC LIMIT 20"""
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@gamification_bp.route("/leaderboard/clan/<int:clan_id>/members", methods=["GET"])
@auth_required
def clan_members_leaderboard(clan_id):
    rows = execute_pg(
        """SELECT u.id, u.username, u.expbara, u.level, u.role,
                  c.name as clan_name, r.name as rank_name, r.icon_url as rank_icon
           FROM users u
           LEFT JOIN clans c ON u.clan_id = c.id
           LEFT JOIN LATERAL (
               SELECT name, icon_url FROM ranks WHERE min_expbara <= u.expbara
               ORDER BY min_expbara DESC LIMIT 1
           ) r ON TRUE
           WHERE u.is_active = TRUE AND u.clan_id = %s
           ORDER BY u.expbara DESC""",
        (clan_id,)
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@gamification_bp.route("/leaderboard/clans", methods=["GET"])
@auth_required
def clan_leaderboard():
    rows = execute_pg(
        """SELECT c.id, c.name, co.name as cohort_name,
                  COALESCE(AVG(u.expbara), 0)::int as avg_expbara,
                  COUNT(u.id) as member_count
           FROM clans c
           LEFT JOIN cohorts co ON c.cohort_id = co.id
           LEFT JOIN users u ON u.clan_id = c.id AND u.is_active = TRUE
           GROUP BY c.id, co.name
           ORDER BY avg_expbara DESC"""
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@gamification_bp.route("/pomodoro/complete", methods=["POST"])
@auth_required
def complete_pomodoro():
    video_id = (request.json or {}).get("video_id")
    xp_result = award_xp(g.current_user["id"], 15, "pomodoro_completed", video_id)

    # Store session in MongoDB
    from src.config.database import get_mongo_db
    db = get_mongo_db()
    if db is not None:
        from datetime import datetime
        db["pomodoro_sessions"].insert_one({
            "user_id": str(g.current_user["id"]),
            "video_id": video_id,
            "duration_seconds": (request.json or {}).get("duration", 600),
            "completed": True,
            "created_at": datetime.utcnow(),
        })

    return jsonify({
        "message": "Pomodoro completed",
        "xp_gained": 15,
        "leveled_up": xp_result.get("leveled_up", False),
        "new_level": xp_result.get("new_level"),
        "new_rank_name": xp_result.get("new_rank_name"),
    }), 200


@gamification_bp.route("/ranks", methods=["GET"])
@auth_required
def list_ranks():
    rows = execute_pg("SELECT * FROM ranks ORDER BY display_order")
    return jsonify([dict(r) for r in (rows or [])]), 200