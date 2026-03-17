import json
from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import auth_required, role_required
from src.services.gamification_service import award_xp

content_bp = Blueprint("content", __name__, url_prefix="/api")


# -- Skill Tree --

@content_bp.route("/skill-tree", methods=["GET"])
@auth_required
def get_skill_tree():
    nodes = execute_pg("SELECT * FROM skill_nodes ORDER BY display_order")
    return jsonify([dict(n) for n in (nodes or [])]), 200


@content_bp.route("/skill-tree", methods=["POST"])
@role_required(["super_admin", "tech_lead"])
def create_skill_node():
    data = request.json or {}
    if not data.get("name"):
        return jsonify({"error": "Name required"}), 400
    node = execute_pg_insert(
        """INSERT INTO skill_nodes (name, description, parent_node_id, display_order, image_url)
           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
        (data["name"], data.get("description"), data.get("parent_node_id"),
         data.get("display_order", 0), data.get("image_url")),
    )
    return jsonify(dict(node)), 201


@content_bp.route("/skill-tree/<int:node_id>", methods=["PUT"])
@role_required(["super_admin", "tech_lead"])
def update_skill_node(node_id):
    data = request.json or {}
    fields, values = [], []
    for key in ["name", "description", "parent_node_id", "display_order", "image_url"]:
        if key in data:
            fields.append(f"{key} = %s")
            values.append(data[key])
    if not fields:
        return jsonify({"error": "No fields to update"}), 400
    values.append(node_id)
    execute_pg(f"UPDATE skill_nodes SET {', '.join(fields)} WHERE id = %s", values, fetch=False)
    return jsonify({"message": "Node updated"}), 200


@content_bp.route("/skill-tree/<int:node_id>", methods=["DELETE"])
@role_required(["super_admin", "tech_lead"])
def delete_skill_node(node_id):
    children = execute_pg_one("SELECT COUNT(*) as cnt FROM skill_nodes WHERE parent_node_id = %s", (node_id,))
    if children and children["cnt"] > 0:
        return jsonify({"error": "Cannot delete node with children. Delete children first."}), 400
    execute_pg("DELETE FROM user_progress WHERE video_id IN (SELECT id FROM videos WHERE skill_node_id = %s)", (node_id,), fetch=False)
    execute_pg("DELETE FROM videos WHERE skill_node_id = %s", (node_id,), fetch=False)
    execute_pg("DELETE FROM skill_nodes WHERE id = %s", (node_id,), fetch=False)
    return jsonify({"message": "Node deleted"}), 200


# -- Videos --

@content_bp.route("/videos", methods=["GET"])
@auth_required
def list_videos():
    skill_node_id = request.args.get("skill_node_id")
    status = request.args.get("status")
    query = "SELECT * FROM videos WHERE 1=1"
    params = []
    if skill_node_id:
        query += " AND skill_node_id = %s"
        params.append(int(skill_node_id))
    if status:
        query += " AND status = %s"
        params.append(status)
    query += " ORDER BY created_at DESC"
    rows = execute_pg(query, params if params else None)
    result = []
    for r in (rows or []):
        d = dict(r)
        if d.get("quiz_options") and isinstance(d["quiz_options"], str):
            try:
                d["quiz_options"] = json.loads(d["quiz_options"])
            except Exception:
                pass
        result.append(d)
    return jsonify(result), 200


@content_bp.route("/videos/<int:video_id>", methods=["GET"])
@auth_required
def get_video(video_id):
    v = execute_pg_one(
        """SELECT v.*, sn.name as skill_node_name 
           FROM videos v
           LEFT JOIN skill_nodes sn ON v.skill_node_id = sn.id
           WHERE v.id = %s""", 
        (video_id,)
    )
    if not v:
        return jsonify({"error": "Video not found"}), 404
    d = dict(v)
    if d.get("quiz_options") and isinstance(d["quiz_options"], str):
        try:
            d["quiz_options"] = json.loads(d["quiz_options"])
        except Exception:
            pass

    progress = execute_pg_one(
        "SELECT status, pomodoros_used, started_at, completed_at FROM user_progress WHERE user_id = %s AND video_id = %s",
        (g.current_user["id"], video_id)
    )
    d["user_progress"] = dict(progress) if progress else None

    return jsonify(d), 200


@content_bp.route("/videos", methods=["POST"])
@role_required(["super_admin", "tech_lead"])
def create_video():
    data = request.json or {}
    if not data.get("title") or not data.get("youtube_url") or not data.get("skill_node_id"):
        return jsonify({"error": "title, youtube_url and skill_node_id required"}), 400
    quiz_opts = json.dumps(data["quiz_options"]) if data.get("quiz_options") else None
    video = execute_pg_insert(
        """INSERT INTO videos (title, youtube_url, description, duration_minutes, skill_node_id,
                               suggested_by_user_id, status, quiz_question, quiz_options, quiz_correct_index)
           VALUES (%s, %s, %s, %s, %s, %s, 'approved', %s, %s, %s) RETURNING *""",
        (data["title"], data["youtube_url"], data.get("description"),
         data.get("duration_minutes", 10), data["skill_node_id"],
         g.current_user["id"], data.get("quiz_question"),
         quiz_opts, data.get("quiz_correct_index")),
    )
    return jsonify(dict(video)), 201


@content_bp.route("/videos/<int:video_id>", methods=["PUT"])
@role_required(["super_admin", "tech_lead"])
def update_video(video_id):
    data = request.json or {}
    fields, values = [], []
    for key in ["title", "youtube_url", "description", "duration_minutes", "status",
                "quiz_question", "quiz_correct_index"]:
        if key in data:
            fields.append(f"{key} = %s")
            values.append(data[key])
    if "quiz_options" in data:
        fields.append("quiz_options = %s")
        values.append(json.dumps(data["quiz_options"]) if data["quiz_options"] else None)
    if not fields:
        return jsonify({"error": "No fields"}), 400
    values.append(video_id)
    execute_pg(f"UPDATE videos SET {', '.join(fields)} WHERE id = %s", values, fetch=False)
    return jsonify({"message": "Video updated"}), 200


@content_bp.route("/videos/<int:video_id>", methods=["DELETE"])
@role_required(["super_admin", "tech_lead"])
def delete_video(video_id):
    execute_pg("DELETE FROM user_progress WHERE video_id = %s", (video_id,), fetch=False)
    execute_pg("DELETE FROM videos WHERE id = %s", (video_id,), fetch=False)
    return jsonify({"message": "Video deleted"}), 200


@content_bp.route("/videos/<int:video_id>/status", methods=["PUT"])
@role_required(["super_admin", "tech_lead"])
def update_video_status(video_id):
    status = (request.json or {}).get("status")
    if status not in ("approved", "rejected", "pending"):
        return jsonify({"error": "Invalid status"}), 400
    execute_pg("UPDATE videos SET status = %s WHERE id = %s", (status, video_id), fetch=False)
    return jsonify({"message": f"Video {status}"}), 200


# -- Progress --

@content_bp.route("/progress/start", methods=["POST"])
@auth_required
def start_video():
    video_id = (request.json or {}).get("video_id")
    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    existing = execute_pg_one(
        "SELECT id FROM user_progress WHERE user_id = %s AND video_id = %s",
        (g.current_user["id"], video_id),
    )
    if existing:
        return jsonify({"message": "Already started", "id": existing["id"]}), 200
    row = execute_pg_insert(
        "INSERT INTO user_progress (user_id, video_id) VALUES (%s, %s) RETURNING id",
        (g.current_user["id"], video_id),
    )
    return jsonify({"message": "Started", "id": row["id"]}), 201


@content_bp.route("/progress/complete/<int:video_id>", methods=["POST"])
@auth_required
def complete_video(video_id):
    existing = execute_pg_one(
        "SELECT id, status FROM user_progress WHERE user_id = %s AND video_id = %s",
        (g.current_user["id"], video_id),
    )
    if not existing or existing["status"] != "in_progress":
        return jsonify({"error": "You must start the video first"}), 400
    execute_pg(
        "UPDATE user_progress SET status = 'completed', completed_at = NOW() WHERE user_id = %s AND video_id = %s",
        (g.current_user["id"], video_id), fetch=False,
    )
    xp_result = award_xp(g.current_user["id"], 50, "video_completed", video_id)
    return jsonify({
        "message": "Video completed",
        "xp_gained": 50,
        "leveled_up": xp_result.get("leveled_up", False),
        "new_level": xp_result.get("new_level"),
        "new_rank_name": xp_result.get("new_rank_name"),
    }), 200


@content_bp.route("/progress/me", methods=["GET"])
@auth_required
def my_progress():
    rows = execute_pg(
        "SELECT * FROM user_progress WHERE user_id = %s ORDER BY started_at DESC",
        (g.current_user["id"],),
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@content_bp.route("/progress/update", methods=["PUT"])
@auth_required
def update_progress():
    data = request.json or {}
    video_id = data.get("video_id")
    pomodoros_used = data.get("pomodoros_used")

    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    if pomodoros_used is None or pomodoros_used < 0:
        return jsonify({"error": "pomodoros_used must be a non-negative integer"}), 400

    existing = execute_pg_one(
        "SELECT id FROM user_progress WHERE user_id = %s AND video_id = %s",
        (g.current_user["id"], video_id),
    )
    if existing:
        execute_pg(
            "UPDATE user_progress SET pomodoros_used = %s WHERE user_id = %s AND video_id = %s",
            (pomodoros_used, g.current_user["id"], video_id),
            fetch=False,
        )
    else:
        execute_pg_insert(
            "INSERT INTO user_progress (user_id, video_id, pomodoros_used) VALUES (%s, %s, %s) RETURNING id",
            (g.current_user["id"], video_id, pomodoros_used),
        )

    return jsonify({"message": "Progress updated", "pomodoros_used": pomodoros_used}), 200


# -- Quiz --

@content_bp.route("/videos/<int:video_id>/quiz", methods=["POST"])
@auth_required
def verify_quiz(video_id):
    selected = (request.json or {}).get("selected_index")
    if selected is None:
        return jsonify({"error": "selected_index required"}), 400
    video = execute_pg_one("SELECT quiz_correct_index FROM videos WHERE id = %s", (video_id,))
    if not video or video["quiz_correct_index"] is None:
        return jsonify({"error": "No quiz for this video"}), 404
    correct = int(selected) == video["quiz_correct_index"]
    xp_result = {}
    if correct:
        xp_result = award_xp(g.current_user["id"], 25, "quiz_correct", video_id)
    return jsonify({
        "correct": correct,
        "message": "Correct! +25 XP" if correct else "Incorrect. Try again!",
        "xp_gained": 25 if correct else 0,
        "leveled_up": xp_result.get("leveled_up", False),
        "new_level": xp_result.get("new_level"),
        "new_rank_name": xp_result.get("new_rank_name"),
    }), 200
