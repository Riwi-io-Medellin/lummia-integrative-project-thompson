from src.config.database import execute_pg, execute_pg_one, execute_pg_insert


def award_xp(user_id, amount, reason, reference_id=None):
    """Award XP and return level-up info: { new_total, leveled_up, new_level, new_rank_name }"""
    # Get old level
    old_user = execute_pg_one("SELECT level, expbara FROM users WHERE id = %s", (user_id,))
    old_level = old_user["level"] if old_user else 1

    # Log the transaction
    execute_pg(
        """INSERT INTO expbara_transactions (user_id, amount, reason, reference_id)
           VALUES (%s, %s, %s, %s)""",
        (user_id, amount, reason, reference_id),
        fetch=False,
    )
    # Update user total
    execute_pg(
        "UPDATE users SET expbara = expbara + %s WHERE id = %s",
        (amount, user_id),
        fetch=False,
    )
    # Recalculate level
    user = execute_pg_one("SELECT expbara FROM users WHERE id = %s", (user_id,))
    new_level = old_level
    new_rank_name = None
    new_total = user["expbara"] if user else 0

    if user:
        rank = execute_pg_one(
            "SELECT display_order, name FROM ranks WHERE min_expbara <= %s ORDER BY min_expbara DESC LIMIT 1",
            (user["expbara"],),
        )
        new_level = rank["display_order"] if rank else 1
        new_rank_name = rank["name"] if rank else None
        execute_pg(
            "UPDATE users SET level = %s WHERE id = %s",
            (new_level, user_id),
            fetch=False,
        )

    # Check if the user qualifies for any new achievements
    check_achievements(user_id)

    return {
        "new_total": new_total,
        "leveled_up": new_level > old_level,
        "new_level": new_level,
        "new_rank_name": new_rank_name,
    }


def check_achievements(user_id):
    """Auto-grant achievements the user qualifies for but hasn't unlocked yet."""

    # Gather the user's stats for each supported criteria
    stat_queries = {
        "videos_completed": "SELECT COUNT(*) AS cnt FROM user_progress WHERE user_id = %s AND status = 'completed'",
        "quizzes_correct": "SELECT COUNT(*) AS cnt FROM expbara_transactions WHERE user_id = %s AND reason = 'quiz_correct'",
        "pomodoros_completed": "SELECT COALESCE(SUM(pomodoros_used), 0) AS cnt FROM user_progress WHERE user_id = %s",
        "posts_approved": "SELECT COUNT(*) AS cnt FROM posts WHERE user_id = %s AND status = 'approved'",
        "comments_made": "SELECT COUNT(*) AS cnt FROM comments WHERE user_id = %s",
        "login_streak": "SELECT 0 AS cnt FROM users WHERE id = %s",
        "rank_reached": "SELECT COALESCE(level, 1) AS cnt FROM users WHERE id = %s",
        "clan_rank": "SELECT COALESCE(level, 1) AS cnt FROM users WHERE id = %s",
    }

    # Find all achievements not yet unlocked by the user
    pending = execute_pg(
        """SELECT a.id, a.criteria, a.threshold
           FROM achievements a
           WHERE a.id NOT IN (
               SELECT achievement_id FROM user_achievements WHERE user_id = %s
           )""",
        (user_id,),
    )

    for achievement in (pending or []):
        criteria = achievement["criteria"]
        threshold = achievement["threshold"]
        query = stat_queries.get(criteria)
        if not query:
            continue
        row = execute_pg_one(query, (user_id,))
        if row and row["cnt"] >= threshold:
            execute_pg_insert(
                """INSERT INTO user_achievements (user_id, achievement_id)
                   VALUES (%s, %s) RETURNING id""",
                (user_id, achievement["id"]),
            )
