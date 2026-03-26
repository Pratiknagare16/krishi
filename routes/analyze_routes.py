# Image + Gemini orchestration
# Accepts images and user queries, triggers Gemini analysis using prompt registry.
import uuid
from services.gemini_service import get_gemini_analysis
from services.prompt_registry import PROMPTS
from database.db import get_db_connection, release_db_connection
from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required

analyze_bp = Blueprint("analyze", __name__)

# Allowed MIME types for uploaded images
ALLOWED_MIMETYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}

# Language mapping for precise AI instruction
LANG_MAP = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu"
}


def _create_or_validate_session(cur, session_id, user_id):
    """Create a new session if none provided. Returns a UUID."""
    if not session_id:
        cur.execute("INSERT INTO sessions (user_id) VALUES (%s) RETURNING id", (user_id,))
        return cur.fetchone()[0]
    # Validate that the provided session_id is a valid UUID format
    try:
        return uuid.UUID(str(session_id))
    except (ValueError, AttributeError):
        raise ValueError(f"Invalid session_id format: {session_id}")


@analyze_bp.route("/analyze-crop", methods=["POST"])
@token_required
def analyze_crop():
    """Route for general crop advisory analysis (multimodal)."""
    image_file = request.files.get("crop_image")
    user_query = request.form.get("query", "")
    session_id = request.form.get("session_id")
    language_code = request.form.get("language", "en")

    if not image_file and not user_query:
        return jsonify({"error": "Please provide an image or a description."}), 400

    # --- File upload validation ---
    if image_file:
        if image_file.mimetype not in ALLOWED_MIMETYPES:
            return jsonify({"error": "Only JPEG, PNG, WebP, or GIF images are supported."}), 415

    # --- Build the AI prompt ---
    target_language = LANG_MAP.get(language_code, "English")
    base_prompt = PROMPTS.get("crop_pest")
    full_prompt = f"{base_prompt}\n\nUSER QUERY: {user_query}" if user_query else base_prompt

    if target_language != "English":
        full_prompt += (
            f"\n\nIMPORTANT INSTRUCTION: You MUST translate and provide your ENTIRE response "
            f"in the {target_language} language. Do not use English unless strictly necessary "
            f"for technical botanical terms."
        )

    # --- Phase 1: Open a DB connection, create/validate session, store user message, release ---
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        validated_session_id = _create_or_validate_session(cur, session_id, g.user.id)
        msg_content = user_query if user_query else "[Image Uploaded]"
        cur.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (%s, %s, %s)",
            (str(validated_session_id), 'user', msg_content)
        )
        conn.commit()
    except (ValueError, Exception) as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        # CRITICAL: Release the connection back to the pool BEFORE calling Gemini.
        # Gemini can take 5-15 seconds. Holding the connection during that time would
        # starve other requests of DB connections under any meaningful load.
        release_db_connection(conn)

    # --- Phase 2: Call Gemini AI (no DB connection held) ---
    try:
        ai_advice = get_gemini_analysis(image_file, full_prompt)
    except Exception as e:
        return jsonify({"error": f"AI analysis failed: {str(e)}"}), 502

    # --- Phase 3: Re-acquire a DB connection to store the AI response ---
    conn2 = get_db_connection()
    cur2 = conn2.cursor()
    try:
        cur2.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (%s, %s, %s)",
            (str(validated_session_id), 'model', ai_advice)
        )
        conn2.commit()
    except Exception as e:
        conn2.rollback()
        # We still have a valid AI response, so we return it even if storing fails.
        # The session_id is returned for the client to keep using.
        return jsonify({"advice": ai_advice, "session_id": str(validated_session_id)}), 200
    finally:
        cur2.close()
        release_db_connection(conn2)

    return jsonify({"advice": ai_advice, "session_id": str(validated_session_id)})
