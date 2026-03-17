import psycopg2
from psycopg2.extras import RealDictCursor
from pymongo import MongoClient
from src.config.env import Config

_mongo_client = None


def get_pg_connection():
    try:
        conn = psycopg2.connect(Config.DATABASE_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"PostgreSQL connection error: {e}")
        return None


def execute_pg(query, params=None, fetch=True):
    conn = get_pg_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        if fetch:
            result = cursor.fetchall()
            conn.close()
            return result
        else:
            conn.commit()
            affected = cursor.rowcount
            conn.close()
            return affected
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e


def execute_pg_one(query, params=None):
    conn = get_pg_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        conn.close()
        raise e


def execute_pg_insert(query, params=None):
    conn = get_pg_connection()
    if not conn:
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        result = cursor.fetchone()
        conn.commit()
        conn.close()
        return result
    except Exception as e:
        conn.rollback()
        conn.close()
        raise e


def get_mongo_db():
    global _mongo_client
    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(Config.MONGO_URI)
            _mongo_client.admin.command("ping")
        return _mongo_client[Config.MONGO_DB_NAME]
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None
