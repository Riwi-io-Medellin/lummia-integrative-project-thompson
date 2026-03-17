from flask import Blueprint, request, jsonify, g
from src.config.database import get_mongo_db
from src.config.env import Config
from src.middleware.auth_middleware import auth_required
from datetime import datetime
import json

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")


@chat_bp.route("", methods=["POST"])
@auth_required
def chat_with_tutor():
    message = (request.json or {}).get("message", "").strip()
    if not message:
        return jsonify({"error": "Message required"}), 400

    user_id = str(g.current_user["id"])
    username = g.current_user["username"]

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=Config.GEMINI_API_KEY)

        # Get conversation history from MongoDB
        db = get_mongo_db()
        context = ""
        if db is not None:
            history = list(
                db["chat_history"]
                .find({"user_id": user_id})
                .sort("timestamp", -1)
                .limit(5)
            )
            for msg in reversed(history):
                context += f"User: {msg.get('mensaje_usuario', '')}\nCapy: {msg.get('respuesta_bot', '')}\n"

        prompt = f"""
        Conversation history:
        {context}

        Current question from {username}: {message}
        """

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are the Capybara Tutor of the Lummia platform. "
                    "You are a wise, relaxed and helpful mentor. You help programming "
                    "and design students. Your responses should be brief, motivating "
                    "and friendly. If the history shows you already greeted or explained "
                    "something, don't repeat yourself. Keep the conversation fluid. "
                    "Respond in the same language the user writes in. "
                    "IMPORTANT ANTI-CHEAT RULE: If a user asks you about quiz questions, "
                    "their options, or which answer is correct for any quiz or evaluation, "
                    "you MUST refuse to give the direct answer. Instead, guide them to "
                    "understand the concept so they can figure it out themselves. Say "
                    "something like 'I can help you understand the concept, but I cannot "
                    "give you the quiz answer directly -- that would be cheating! Think "
                    "about it and you will get it.' Never reveal correct quiz answers, "
                    "correct option indices, or confirm/deny which option is right."
                )
            ),
        )

        reply = response.text if response and response.text else "I'm having connection issues. Try again."

        # Save to MongoDB
        if db is not None:
            db["chat_history"].insert_one({
                "user_id": user_id,
                "mensaje_usuario": message,
                "respuesta_bot": reply,
                "timestamp": datetime.utcnow(),
            })

        return jsonify({"reply": reply}), 200

    except Exception as e:
        return jsonify({"reply": f"Tutor is resting. Error: {str(e)}"}), 200


@chat_bp.route("/history/<user_id>", methods=["GET"])
@auth_required
def get_history(user_id):
    db = get_mongo_db()
    if db is None:
        return jsonify({"history": []}), 200
    history = list(
        db["chat_history"]
        .find({"user_id": user_id})
        .sort("timestamp", -1)
        .limit(15)
    )
    # Convert ObjectId to string
    for h in history:
        h["_id"] = str(h["_id"])
        if isinstance(h.get("timestamp"), datetime):
            h["timestamp"] = h["timestamp"].isoformat()
    return jsonify({"history": history[::-1]}), 200
