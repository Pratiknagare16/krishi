# Krishi Officer - Project Briefing

## 1. Project Overview

**What problem this project solves:**
Krishi Officer aims to provide farmers (specifically in Indian farming conditions) with accessible, AI-powered agricultural guidance. It helps identify crop diseases, detect pests, and offers organic-first remediation and general crop health advisory.

**Core objective and use case:**
The application allows farmers to upload images of their crops, pests, soil, or water and ask questions in a chat-like interface. The system uses Google's Gemini Vision AI to analyze the images and text to provide actionable, easy-to-understand advice.

## 2. System Architecture

**High-level architecture:**
The project follows a Monolithic architecture with a client-server model.

- **Frontend:** Vanilla HTML/CSS/JS served directly by the backend.
- **Backend:** A Flask web application that serves both the UI templates and the API endpoints for AI analysis.
- **External Services:** Google Generative AI (Gemini 2.5 Flash) for multimodal image and text analysis.
- **Database (Planned):** PostgreSQL is intended for session and chat history storage, though the current implementation relies entirely on stateless API calls.

**How components interact:**

1. The user interacts with the UI (`crop-advisory.html` or `pest-detection.html`), uploading an image and typing a query.
2. The frontend JavaScript (`crop-advisory.js`, `pest_detection.js`) constructs a `FormData` object and sends a `POST` request to the backend `/analyze-crop` route.
3. The Flask route matches the request to a specific prompt template from `prompt_registry.py`.
4. The `gemini_service.py` securely calls the Gemini API with the image and prompt.
5. The Markdown response is returned to the frontend, parsed by a custom regex formatter in JS, and displayed to the user.

## 3. Tech Stack

**Languages & Frameworks:**

- **Backend:** Python 3.8+, Flask
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **AI Integration:** `google-generativeai` (Gemini API)
- **Image Processing:** `Pillow` (PIL)

**Infrastructure & Tools:**

- **Database:** PostgreSQL (via `psycopg2` - currently unimplemented)
- **Environment Management:** `python-dotenv` for `.env` loading, `venv` for virtual environments.

## 4. Codebase Breakdown

**Key directories and responsibilities:**

- `app.py`: The main entry point that configures Flask and registers blueprints (routes).
- `routes/`: Contains controllers for the API endpoints.
  - `analyze_routes.py` (Active): Handles image upload and coordinates with the AI service.
  - `session_routes.py` & `message_routes.py` (Stubs): Intended for chat history CRUD.
- `services/`: Contains core business logic.
  - `gemini_service.py`: Wrapper for the Google Gemini API.
  - `prompt_registry.py`: A vital file containing strict, tailored system prompts for different analysis types (Crop Health, Soil, Water).
- `database/`: Database connection (`db.py`) and table definitions (`schema.sql`).
- `static/` & `templates/`: Contains the frontend assets (CSS, JS, Images) and HTML views.

## 5. Features & Functionality

**Major implemented features:**

- **Crop/Pest Analysis:** Users can upload an image and optional text. The AI correctly differentiates between general "Crop Health Advisory" (no pest visible) and "Pest Detection Analysis" (pest visible) based on strict prompt constraints.
- **Markdown Response Parsing:** The frontend successfully parses Gemini's markdown response into clean HTML.
- **Responsive UI:** The frontend includes a stylized dashboard and landing page with smooth scrolling, ripples, and basic animations.

**Partially implemented or planned features (Gaps):**

- **Soil and Water Analysis:** Backend routes (`/analyze-soil`, `/analyze-water`) and prompts exist, but the frontend files do not utilize them.
- **Persistent Chat History:** The README mentions UUID-based chat sessions, but `session_routes.py`, `message_routes.py`, and database logic are completely empty. The frontend has no UI for historical chats.
- **Dashboard Data:** The dashboard shows static placeholder data ("Wheat: Attention needed", "Weather: 28°C").

## 6. Data & Integrations

**Databases, schemas, models:**

- The project is configured to use PostgreSQL (`DATABASE_URL`), but `schema.sql` only contains introductory comments about UUIDs. No tables (users, sessions, messages) are actively created or queried.

**External APIs or services used:**

- **Google Gemini API:** Utilizes the `gemini-2.5-flash` model. Prompts are heavily engineered to restrict the AI from hallucinating or providing chemical pesticide recommendations, enforcing an organic-first approach.

## 7. Execution & Setup

**How to run locally:**

1. Ensure Python 3.8+ is installed.
2. Initialize virtual environment: `python -m venv venv` and activate it.
3. Install dependencies: _Note: `requirements.txt` is missing from the repository._ Dependencies include `flask`, `google-generativeai`, `python-dotenv`, `pillow`, `psycopg2`.
4. Create a `.env` file containing `GEMINI_API_KEY`, `DATABASE_URL`, `FLASK_ENV`, `SECRET_KEY`.
5. Run the server: `python app.py` (Runs on `http://localhost:5000` or `0.0.0.0`).

## 8. Current State & Gaps

**Project State:** **MVP / Proof of Concept**
The core functionality (taking a picture of a crop and getting AI advice) works beautifully. However, the surrounding ecosystem (history, dashboard, user accounts) is purely visual.

**Missing pieces & incomplete areas:**

1. **Missing `requirements.txt`:** The README instructs users to run `pip install -r requirements.txt`, but the file is absent.
2. **Missing Database Implementation:** `schema.sql` and `db.py` are stubs. `session_routes` and `message_routes` have no code.
3. **Frontend-Backend Disconnect:** `crop-advisory.js` and `pest_detection.js` are virtually identical; both hit `/analyze-crop`. The specific soil and water APIs are uncalled by the frontend.
4. **Mocked Dashboard:** The main dashboard view has zero dynamic data.

## 9. Summary

**Krishi Officer** is an AI-powered agricultural assistant designed to help Indian farmers diagnose crop and pest issues using Google Gemini Vision. The application successfully implements the core AI image analysis loop with prompt engineering that ensures safe, organic-first advice. However, the project is currently in an MVP state, with the "persistent chat history" and database layers planned but entirely unwritten, and dashboard features existing only as frontend mockups.
