from flask import Blueprint, request, jsonify, g
from src.config.database import execute_pg, execute_pg_one, execute_pg_insert
from src.middleware.auth_middleware import auth_required, role_required
from src.services.gamification_service import award_xp

feed_bp = Blueprint("feed", __name__, url_prefix="/api/feed")


@feed_bp.route("/posts", methods=["GET"])
@auth_required
def list_posts():
    u = g.current_user
    if u["role"] in ("super_admin", "tech_lead"):
        posts = execute_pg("SELECT * FROM posts ORDER BY created_at DESC LIMIT 50")
    else:
        posts = execute_pg(
            "SELECT * FROM posts WHERE status = 'approved' OR user_id = %s ORDER BY created_at DESC LIMIT 50",
            (u["id"],),
        )

    result = []
    for p in (posts or []):
        d = dict(p)
        author = execute_pg_one("SELECT username FROM users WHERE id = %s", (d["user_id"],))
        d["author_name"] = author["username"] if author else "Unknown"
        like_row = execute_pg_one("SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = %s", (d["id"],))
        d["like_count"] = like_row["cnt"] if like_row else 0
        user_liked = execute_pg_one(
            "SELECT id FROM post_likes WHERE post_id = %s AND user_id = %s",
            (d["id"], u["id"]),
        )
        d["user_liked"] = user_liked is not None
        comment_row = execute_pg_one("SELECT COUNT(*) as cnt FROM comments WHERE post_id = %s", (d["id"],))
        d["comment_count"] = comment_row["cnt"] if comment_row else 0
        result.append(d)
    return jsonify(result), 200


@feed_bp.route("/posts", methods=["POST"])
@auth_required
def create_post():
    data = request.json or {}
    if not data.get("title") or not data.get("content"):
        return jsonify({"error": "title and content required"}), 400
    status = "approved" if g.current_user["role"] in ("super_admin", "tech_lead") else "pending"
    post = execute_pg_insert(
        """INSERT INTO posts (user_id, title, content, post_type, status)
           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
        (g.current_user["id"], data["title"], data["content"],
         data.get("post_type", "general"), status),
    )
    return jsonify(dict(post)), 201


@feed_bp.route("/posts/<int:post_id>/status", methods=["PUT"])
@role_required(["super_admin", "tech_lead"])
def moderate_post(post_id):
    status = (request.json or {}).get("status")
    if status not in ("approved", "rejected"):
        return jsonify({"error": "Invalid status"}), 400
    post = execute_pg_one("SELECT user_id FROM posts WHERE id = %s", (post_id,))
    if not post:
        return jsonify({"error": "Post not found"}), 404
    execute_pg(
        "UPDATE posts SET status = %s, approved_by_user_id = %s WHERE id = %s",
        (status, g.current_user["id"], post_id), fetch=False,
    )
    if status == "approved":
        award_xp(post["user_id"], 30, "post_approved", post_id)
    return jsonify({"message": f"Post {status}"}), 200


@feed_bp.route("/posts/<int:post_id>", methods=["DELETE"])
@role_required(["super_admin", "tech_lead"])
def delete_post(post_id):
    execute_pg("DELETE FROM comments WHERE post_id = %s", (post_id,), fetch=False)
    execute_pg("DELETE FROM post_likes WHERE post_id = %s", (post_id,), fetch=False)
    execute_pg("DELETE FROM posts WHERE id = %s", (post_id,), fetch=False)
    return jsonify({"message": "Post deleted"}), 200


@feed_bp.route("/posts/<int:post_id>/like", methods=["POST"])
@auth_required
def toggle_like(post_id):
    existing = execute_pg_one(
        "SELECT id FROM post_likes WHERE post_id = %s AND user_id = %s",
        (post_id, g.current_user["id"]),
    )
    if existing:
        execute_pg("DELETE FROM post_likes WHERE id = %s", (existing["id"],), fetch=False)
        liked = False
    else:
        execute_pg_insert(
            "INSERT INTO post_likes (post_id, user_id) VALUES (%s, %s) RETURNING id",
            (post_id, g.current_user["id"]),
        )
        liked = True
    count = execute_pg_one("SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = %s", (post_id,))
    return jsonify({"liked": liked, "like_count": count["cnt"] if count else 0}), 200


@feed_bp.route("/posts/<int:post_id>/comments", methods=["GET"])
@auth_required
def list_comments(post_id):
    rows = execute_pg(
        """SELECT c.*, u.username as author_name
           FROM comments c JOIN users u ON c.user_id = u.id
           WHERE c.post_id = %s ORDER BY c.created_at""",
        (post_id,),
    )
    return jsonify([dict(r) for r in (rows or [])]), 200


@feed_bp.route("/posts/<int:post_id>/comments", methods=["POST"])
@auth_required
def create_comment(post_id):
    content = (request.json or {}).get("content", "").strip()
    if not content:
        return jsonify({"error": "Content required"}), 400
    comment = execute_pg_insert(
        "INSERT INTO comments (post_id, user_id, content) VALUES (%s, %s, %s) RETURNING *",
        (post_id, g.current_user["id"], content),
    )
    d = dict(comment)
    d["author_name"] = g.current_user["username"]
    return jsonify(d), 201