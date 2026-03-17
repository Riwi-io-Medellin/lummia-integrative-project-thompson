from flask import Blueprint, request, jsonify, g
from src.config.database import get_mongo_db
from src.middleware.auth_middleware import auth_required, decode_token
from datetime import datetime, timezone

clan_chat_bp = Blueprint("clan_chat", __name__, url_prefix="/api/clan/chat")


@clan_chat_bp.route("/history/<int:clan_id>", methods=["GET"])
@auth_required
def chat_history(clan_id):
    db = get_mongo_db()
    if db is None:
        return jsonify({"messages": []}), 200

    limit = request.args.get("limit", 50, type=int)
    messages = list(
        db["clan_chat"]
        .find({"clan_id": clan_id})
        .sort("timestamp", -1)
        .limit(limit)
    )

    for m in messages:
        m["_id"] = str(m["_id"])
        if isinstance(m.get("timestamp"), datetime):
            m["timestamp"] = m["timestamp"].isoformat()

    return jsonify({"messages": messages[::-1]}), 200


@clan_chat_bp.route("/send", methods=["POST"])
@auth_required
def send_message():
    from src.config.database import execute_pg_one
    content = (request.json or {}).get("content", "").strip()
    if not content:
        return jsonify({"error": "Message content required"}), 400

    user = execute_pg_one(
        "SELECT id, username, clan_id FROM users WHERE id = %s AND is_active = TRUE",
        (g.current_user["id"],),
    )
    if not user or not user["clan_id"]:
        return jsonify({"error": "User has no clan"}), 403

    now = datetime.now(timezone.utc)
    message_doc = {
        "clan_id": user["clan_id"],
        "user_id": user["id"],
        "username": user["username"],
        "content": content,
        "timestamp": now,
    }

    db = get_mongo_db()
    if db is not None:
        db["clan_chat"].insert_one(message_doc)
        message_doc["_id"] = str(message_doc["_id"])
    else:
        message_doc["_id"] = ""
    message_doc["timestamp"] = message_doc["timestamp"].isoformat()

    # Broadcast via SocketIO to the clan room
    try:
        from app import socketio
        room = f"clan_{user['clan_id']}"
        print(f"[CLAN CHAT] Broadcasting to room '{room}' from user {user['username']}")
        socketio.emit("receive_message", {
            "user_id": user["id"],
            "username": user["username"],
            "content": content,
            "timestamp": message_doc["timestamp"],
        }, to=room)
        print(f"[CLAN CHAT] Broadcast sent to room '{room}'")
    except Exception as e:
        print(f"[CLAN CHAT] SocketIO broadcast failed: {e}")

    return jsonify({"message": "Message sent", "data": message_doc}), 201


def register_socket_events(socketio):
    """Register all clan chat SocketIO events. Called from app.py."""

    @socketio.on("connect")
    def handle_connect():
        from flask import request as flask_request
        print(f"[SOCKET] Client connected: sid={flask_request.sid}")

    @socketio.on("disconnect")
    def handle_disconnect():
        from flask import request as flask_request
        print(f"[SOCKET] Client disconnected: sid={flask_request.sid}")

    @socketio.on("join_clan")
    def handle_join_clan(data):
        from flask_socketio import join_room, emit
        from flask import request as flask_request

        print(f"[SOCKET] join_clan event received, sid={flask_request.sid}")

        token = data.get("token")
        if not token:
            print("[SOCKET] join_clan FAILED: no token")
            emit("error", {"error": "Token required"})
            return

        user_id = decode_token(token)
        if not user_id:
            print("[SOCKET] join_clan FAILED: invalid/expired token")
            emit("error", {"error": "Invalid or expired token"})
            return

        from src.config.database import execute_pg_one

        user = execute_pg_one(
            "SELECT id, username, clan_id FROM users WHERE id = %s AND is_active = TRUE",
            (user_id,),
        )
        if not user or not user["clan_id"]:
            print(f"[SOCKET] join_clan FAILED: user {user_id} has no clan")
            emit("error", {"error": "User has no clan"})
            return

        room = f"clan_{user['clan_id']}"
        join_room(room)
        print(f"[SOCKET] {user['username']} (id={user['id']}) joined room '{room}', sid={flask_request.sid}")
        emit("joined", {
            "message": f"{user['username']} joined the clan chat",
            "clan_id": user["clan_id"],
        }, to=room)

    @socketio.on("send_message")
    def handle_send_message(data):
        from flask_socketio import emit
        from src.config.database import execute_pg_one

        token = data.get("token")
        content = (data.get("content") or "").strip()

        if not token:
            emit("error", {"error": "Token required"})
            return
        if not content:
            emit("error", {"error": "Message content required"})
            return

        user_id = decode_token(token)
        if not user_id:
            emit("error", {"error": "Invalid or expired token"})
            return

        user = execute_pg_one(
            "SELECT id, username, clan_id FROM users WHERE id = %s AND is_active = TRUE",
            (user_id,),
        )
        if not user or not user["clan_id"]:
            emit("error", {"error": "User has no clan"})
            return

        now = datetime.now(timezone.utc)
        message_doc = {
            "clan_id": user["clan_id"],
            "user_id": user["id"],
            "username": user["username"],
            "content": content,
            "timestamp": now,
        }

        # Store in MongoDB
        db = get_mongo_db()
        if db is not None:
            db["clan_chat"].insert_one(message_doc)

        # Broadcast to the clan room
        room = f"clan_{user['clan_id']}"
        emit("receive_message", {
            "user_id": user["id"],
            "username": user["username"],
            "content": content,
            "timestamp": now.isoformat(),
        }, to=room)