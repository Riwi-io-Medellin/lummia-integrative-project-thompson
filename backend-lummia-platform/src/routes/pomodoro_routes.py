import json
from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import auth_required

pomodoro_bp = Blueprint("pomodoro", __name__, url_prefix="/api/pomodoro")


@pomodoro_bp.route("/tasks", methods=["GET"])
@auth_required
def list_tasks():
    rows = execute_pg(
        "SELECT * FROM pomodoro_tasks WHERE user_id = %s ORDER BY created_at DESC",
        (g.current_user["id"],),
    )
    
    tasks = []
    for r in (rows or []):
        d = dict(r)
        val = d.get("day_states")
        if val and isinstance(val, str):
            try:
                d["day_states"] = json.loads(val)
            except Exception:
                pass
        tasks.append(d)

    return jsonify({
        "feature": "Focus Hub",
        "tasks": tasks,
    }), 200


@pomodoro_bp.route("/tasks", methods=["POST"])
@auth_required
def create_task():
    task_text = (request.json or {}).get("task_text", "").strip()
    if not task_text:
        return jsonify({"error": "task_text required"}), 400

    row = execute_pg_insert(
        """INSERT INTO pomodoro_tasks (user_id, task_text)
           VALUES (%s, %s) RETURNING *""",
        (g.current_user["id"], task_text),
    )
    return jsonify({
        "message": "Focus Hub task created",
        "task": dict(row),
    }), 201


@pomodoro_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@auth_required
def update_task(task_id):
    existing = execute_pg_one(
        "SELECT id, user_id FROM pomodoro_tasks WHERE id = %s",
        (task_id,),
    )
    if not existing:
        return jsonify({"error": "Task not found"}), 404
    if existing["user_id"] != g.current_user["id"]:
        return jsonify({"error": "Not your task"}), 403

    data = request.json or {}
    fields, values = [], []
    if "task_text" in data:
        fields.append("task_text = %s")
        values.append(data["task_text"])
    if "day_states" in data:
        fields.append("day_states = %s")
        val = data["day_states"]
        values.append(json.dumps(val) if isinstance(val, (dict, list)) else val)

    if not fields:
        return jsonify({"error": "No fields to update"}), 400

    values.append(task_id)
    execute_pg(
        f"UPDATE pomodoro_tasks SET {', '.join(fields)} WHERE id = %s",
        values,
        fetch=False,
    )
    return jsonify({"message": "Focus Hub task updated"}), 200


@pomodoro_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@auth_required
def delete_task(task_id):
    existing = execute_pg_one(
        "SELECT id, user_id FROM pomodoro_tasks WHERE id = %s",
        (task_id,),
    )
    if not existing:
        return jsonify({"error": "Task not found"}), 404
    if existing["user_id"] != g.current_user["id"]:
        return jsonify({"error": "Not your task"}), 403

    execute_pg(
        "DELETE FROM pomodoro_tasks WHERE id = %s", (task_id,), fetch=False
    )
    return jsonify({"message": "Focus Hub task deleted"}), 200


@pomodoro_bp.route("/tasks/all", methods=["DELETE"])
@auth_required
def delete_all_tasks():
    execute_pg(
        "DELETE FROM pomodoro_tasks WHERE user_id = %s",
        (g.current_user["id"],),
        fetch=False
    )
    return jsonify({"message": "All Focus Hub tasks deleted"}), 200
