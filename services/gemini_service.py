import os
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# Lazy initialization — we configure the model only on first call.
# This prevents a crash at import time when GEMINI_API_KEY is missing
# (which always happens during Vercel's build phase).
_model = None


def _get_model():
    """Configure and cache the Gemini model on first use."""
    global _model
    if _model is None:
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. "
                "Add it to Vercel Environment Variables or your local .env file."
            )
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel('gemini-2.5-flash')
    return _model


def get_gemini_analysis(image_file=None, prompt=None):
    """
    Centralized function to get AI analysis.
    Supports Image + Text, Text only, or Image only (with default prompt).
    """
    if not image_file and not prompt:
        raise ValueError("Either an image or a prompt must be provided.")

    contents = []

    if prompt:
        contents.append(prompt)

    if image_file:
        try:
            img = Image.open(image_file)
            contents.append(img)
        except Exception as e:
            raise ValueError(f"Failed to process image: {str(e)}")

    try:
        model = _get_model()
        response = model.generate_content(contents)
        return response.text
    except Exception as e:
        raise Exception(f"AI Generation Error: {str(e)}")