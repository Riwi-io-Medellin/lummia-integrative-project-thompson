from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import role_required, hash_password

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/users", methods=["GET"])
@role_required(["super_admin", "tech_lead"])
def list_users():
    users = execute_pg(
        """SELECT u.id, u.username, u.email, u.role, u.expbara, u.level,
                  u.clan_id, u.cohort_id, u.is_active, u.created_at,
                  c.name as clan_name, co.name as cohort_name
           FROM users u
           LEFT JOIN clans c ON u.clan_id = c.id
           LEFT JOIN cohorts co ON u.cohort_id = co.id
           ORDER BY u.created_at DESC"""
    )
    return jsonify([dict(u) for u in (users or [])]), 200


@admin_bp.route("/users", methods=["POST"])
@role_required(["super_admin"])
def create_user():
    data = request.json or {}
    required = ["username", "email", "password"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "username, email and password required"}), 400

    role = data.get("role", "user")
    if role == "super_admin" and g.current_user["role"] != "super_admin":
        return jsonify({"error": "Only super_admin can create super_admin"}), 403

    hashed = hash_password(data["password"])
    try:
        user = execute_pg_insert(
            """INSERT INTO users (username, email, password_hash, role, clan_id, cohort_id, must_change_password)
               VALUES (%s, %s, %s, %s, %s, %s, TRUE) RETURNING id, username, email, role""",
            (data["username"], data["email"], hashed, role,
             data.get("clan_id"), data.get("cohort_id")),
        )
        return jsonify(dict(user)), 201
    except Exception as e:
        if "duplicate" in str(e).lower():
            return jsonify({"error": "Email already exists"}), 409
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@role_required(["super_admin"])
def update_user(user_id):
    data = request.json or {}
    fields, values = [], []
    for key in ["username", "email", "role", "clan_id", "cohort_id", "is_active"]:
        if key in data:
            fields.append(f"{key} = %s")
            values.append(data[key])
    if not fields:
        return jsonify({"error": "No fields to update"}), 400
    values.append(user_id)
    execute_pg(
        f"UPDATE users SET {', '.join(fields)} WHERE id = %s", values, fetch=False
    )
    return jsonify({"message": "User updated"}), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@role_required(["super_admin"])
def delete_user(user_id):
    execute_pg("UPDATE users SET is_active = FALSE WHERE id = %s", (user_id,), fetch=False)
    return jsonify({"message": "User deactivated"}), 200


@admin_bp.route("/cohorts", methods=["GET"])
@role_required(["super_admin", "tech_lead"])
def list_cohorts():
    rows = execute_pg("SELECT * FROM cohorts ORDER BY id")
    return jsonify([dict(r) for r in (rows or [])]), 200


@admin_bp.route("/cohorts", methods=["POST"])
@role_required(["super_admin"])
def create_cohort():
    name = (request.json or {}).get("name", "").strip()
    if not name:
        return jsonify({"error": "Name required"}), 400
    row = execute_pg_insert("INSERT INTO cohorts (name) VALUES (%s) RETURNING id, name", (name,))
    return jsonify(dict(row)), 201


@admin_bp.route("/clans", methods=["GET"])
@role_required(["super_admin", "tech_lead"])
def list_clans():
    rows = execute_pg(
        """SELECT c.*, co.name as cohort_name,
                  COALESCE(AVG(u.expbara), 0)::int as avg_expbara,
                  COUNT(u.id) as member_count
           FROM clans c
           LEFT JOIN cohorts co ON c.cohort_id = co.id
           LEFT JOIN users u ON u.clan_id = c.id
           GROUP BY c.id, co.name
           ORDER BY avg_expbara DESC"""
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@admin_bp.route("/clans", methods=["POST"])
@role_required(["super_admin"])
def create_clan():
    data = request.json or {}
    if not data.get("name") or not data.get("cohort_id"):
        return jsonify({"error": "name and cohort_id required"}), 400
    row = execute_pg_insert(
        "INSERT INTO clans (name, cohort_id) VALUES (%s, %s) RETURNING id, name",
        (data["name"], data["cohort_id"]),
    )
    return jsonify(dict(row)), 201


@admin_bp.route("/ranks", methods=["GET"])
@role_required(["super_admin", "tech_lead"])
def list_ranks():
    rows = execute_pg("SELECT * FROM ranks ORDER BY display_order")
    return jsonify([dict(r) for r in (rows or [])]), 200
