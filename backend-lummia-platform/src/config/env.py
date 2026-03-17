import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("DEBUG", "True") == "True"
    SECRET_KEY = os.getenv("SECRET_KEY", "lummia-secret-key-change-in-production")

    # PostgreSQL (Neon)
    DATABASE_URL = os.getenv("DATABASE_URL", "")

    # MongoDB Atlas
    MONGO_URI = os.getenv("MONGO_URI", "")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "lummia_platform_db")

    # Gemini AI
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # YouTube
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
    YOUTUBE_CHANNEL_ID = os.getenv("CHANNEL_ID", "")

    # JWT
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24

    @classmethod
    def validate(cls):
        required = ["DATABASE_URL", "MONGO_URI", "GEMINI_API_KEY"]
        missing = [v for v in required if not getattr(cls, v)]
        if missing:
            raise ValueError(f"Missing config: {', '.join(missing)}")
