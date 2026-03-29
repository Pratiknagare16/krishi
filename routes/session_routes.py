import uuid
from flask import Blueprint, jsonify, request, g
from database.db import get_sessions, get_messages, session_belongs_to_user
from middleware.auth_middleware import token_required

session_bp = Blueprint("sessions", __name__)


@session_bp.route("/sessions", methods=["GET"])
@token_required
def list_sessions():
    """Return the 50 most recent sessions (paginated with offset support)."""
    try:
        offset = int(request.args.get("offset", 0))
    except ValueError:
        offset = 0

    sessions = get_sessions(g.user.id, offset=offset)
    return jsonify([{"id": s["id"], "created_at": s["created_at"]} for s in sessions])


@session_bp.route("/sessions/<session_id>/messages", methods=["GET"])
@token_required
def list_messages(session_id):
    """Return all messages belonging to a session."""
    # Validate UUID before querying
    try:
        uuid.UUID(session_id)
    except (ValueError, AttributeError):
        return jsonify({"error": "Invalid session ID format."}), 400

    if not session_belongs_to_user(session_id, g.user.id):
        return jsonify({"error": "Session not found or unauthorized."}), 404

    messages = get_messages(session_id)
    return jsonify([
        {"id": m["id"], "role": m["role"], "content": m["content"], "created_at": m["created_at"]}
        for m in messages
    ])