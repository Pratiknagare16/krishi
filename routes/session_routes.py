import uuid
from flask import Blueprint, jsonify, request, g
from database.db import get_db_connection, release_db_connection
from middleware.auth_middleware import token_required

session_bp = Blueprint("sessions", __name__)


@session_bp.route("/sessions", methods=["GET"])
@token_required
def get_sessions():
    """Return the 50 most recent sessions (paginated with offset support)."""
    try:
        offset = int(request.args.get("offset", 0))
    except ValueError:
        offset = 0

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT id, created_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50 OFFSET ?",
            (g.user.id, offset)
        )
        sessions = cur.fetchall()
    finally:
        cur.close()
        release_db_connection(conn)

    return jsonify([{"id": str(s[0]), "created_at": s[1].isoformat() if hasattr(s[1], 'isoformat') else s[1]} for s in sessions])


@session_bp.route("/sessions/<session_id>/messages", methods=["GET"])
@token_required
def get_messages(session_id):
    """Return all messages belonging to a session."""
    # Validate UUID before hitting the database — Postgres raises DataError on bad castes.
    try:
        validated_id = uuid.UUID(session_id)
    except (ValueError, AttributeError):
        return jsonify({"error": "Invalid session ID format."}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # First verify the session belongs to the user
        cur.execute("SELECT id FROM sessions WHERE id = ? AND user_id = ?", (str(validated_id), g.user.id))
        if not cur.fetchone():
            return jsonify({"error": "Session not found or unauthorized."}), 404

        cur.execute(
            "SELECT id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC",
            (str(validated_id),)
        )
        messages = cur.fetchall()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

    return jsonify([
        {"id": m[0], "role": m[1], "content": m[2], "created_at": m[3].isoformat() if hasattr(m[3], 'isoformat') else m[3]}
        for m in messages
    ])