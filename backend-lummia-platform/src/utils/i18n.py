TRANSLATIONS = {
    "welcome_back": {"es": "Bienvenido de nuevo", "en": "Welcome back"},
    "login_success": {"es": "Acceso concedido", "en": "Access granted"},
    "invalid_credentials": {"es": "Credenciales invalidas", "en": "Invalid credentials"},
    "user_created": {"es": "Usuario creado exitosamente", "en": "User created successfully"},
    "user_not_found": {"es": "Usuario no encontrado", "en": "User not found"},
    "token_required": {"es": "Token requerido", "en": "Token required"},
    "permission_denied": {"es": "Permisos insuficientes", "en": "Insufficient permissions"},
    "post_pending": {"es": "Publicacion enviada para aprobacion", "en": "Post submitted for approval"},
    "post_approved": {"es": "Publicacion aprobada", "en": "Post approved"},
    "video_completed": {"es": "Video completado", "en": "Video completed"},
    "quiz_correct": {"es": "Respuesta correcta", "en": "Correct answer"},
    "quiz_wrong": {"es": "Respuesta incorrecta. Intenta de nuevo", "en": "Wrong answer. Try again"},
    "pomodoro_completed": {"es": "Pomodoro completado", "en": "Pomodoro completed"},
    "node_created": {"es": "Rama creada", "en": "Branch created"},
    "node_deleted": {"es": "Rama eliminada", "en": "Branch deleted"},
    "video_added": {"es": "Video agregado", "en": "Video added"},
    "deleted": {"es": "Eliminado", "en": "Deleted"},
    "not_found": {"es": "No encontrado", "en": "Not found"},
    "has_children": {"es": "No se puede eliminar una rama con hijas", "en": "Cannot delete a branch with children"},
    "password_changed": {"es": "Contrasena actualizada", "en": "Password updated"},
    "db_error": {"es": "Error de base de datos", "en": "Database error"},
}


def t(key, lang="es"):
    entry = TRANSLATIONS.get(key, {})
    return entry.get(lang, entry.get("es", key))