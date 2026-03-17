import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from src.config.env import Config
from src.routes.auth_routes import auth_bp, users_bp
from src.routes.admin_routes import admin_bp
from src.routes.content_routes import content_bp
from src.routes.feed_routes import feed_bp
from src.routes.gamification_routes import gamification_bp
from src.routes.chat_routes import chat_bp
from src.routes.achievement_routes import achievement_bp
from src.routes.pomodoro_routes import pomodoro_bp
from src.routes.clan_chat_routes import clan_chat_bp, register_socket_events

socketio = SocketIO(async_mode='gevent')


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY

    # CORS: en produccion usar FRONTEND_URL, en desarrollo permite todo
    allowed_origins = os.getenv("FRONTEND_URL", "*")
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(content_bp)
    app.register_blueprint(feed_bp)
    app.register_blueprint(gamification_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(achievement_bp)
    app.register_blueprint(pomodoro_bp)
    app.register_blueprint(clan_chat_bp)

    # Init SocketIO with CORS
    socketio.init_app(app, cors_allowed_origins=allowed_origins)

    # Register WebSocket events
    register_socket_events(socketio)

    @app.route("/")
    def health():
        return {"status": "online", "message": "Lummia Platform API", "version": "2.1.0"}, 200

    return app


if __name__ == "__main__":
    Config.validate()
    app = create_app()
    print(f"\n{'='*45}")
    print(f" LUMMIA PLATFORM API v2.1.0")
    print(f" http://localhost:{Config.PORT}")
    print(f" WebSocket enabled")
    print(f"{'='*45}\n")
    socketio.run(app, host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG, allow_unsafe_werkzeug=True)