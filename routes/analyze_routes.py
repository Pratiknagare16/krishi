# Image + Gemini orchestration
# Accepts images and user queries, triggers Gemini analysis using prompt registry.
import uuid
from services.gemini_service import get_gemini_analysis
from services.prompt_registry import PROMPTS
from database.db import create_session, insert_message
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

    # --- Create or reuse session ---
    try:
        if not session_id:
            session_id = create_session(g.user.id)
        else:
            # Validate UUID format
            try:
                uuid.UUID(str(session_id))
            except (ValueError, AttributeError):
                return jsonify({"error": f"Invalid session_id format: {session_id}"}), 400

        # Store user message
        msg_content = user_query if user_query else "[Image Uploaded]"
        insert_message(session_id, "user", msg_content)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # --- Call Gemini AI ---
    try:
        ai_advice = get_gemini_analysis(image_file, full_prompt)
    except Exception as e:
        return jsonify({"error": f"AI analysis failed: {str(e)}"}), 502

    # --- Store AI response ---
    try:
        insert_message(session_id, "model", ai_advice)
    except Exception:
        # We still have a valid AI response, return it even if storing fails
        pass

    return jsonify({"advice": ai_advice, "session_id": str(session_id)})
