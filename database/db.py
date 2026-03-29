"""
Database layer — Supabase-backed.

Replaces the old SQLite implementation because Vercel serverless functions
have a read-only filesystem, making sqlite3 unusable.

The public interface (get_db / release_db / helper functions) stays the same
so that route code requires minimal changes.

PREREQUISITE — Run this SQL in your Supabase SQL Editor:
------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
------------------------------------------------------
"""

from supabase_client import supabase


# ---------- Session helpers ----------

def create_session(user_id, session_id=None):
    """Create a new chat session. Returns the session UUID string."""
    row = {"user_id": user_id}
    if session_id:
        row["id"] = str(session_id)
    res = supabase.table("sessions").insert(row).execute()
    return res.data[0]["id"]


def get_sessions(user_id, offset=0, limit=50):
    """Return the most recent sessions for a user."""
    res = (
        supabase.table("sessions")
        .select("id, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data


def session_belongs_to_user(session_id, user_id):
    """Check whether a session exists and belongs to the given user."""
    res = (
        supabase.table("sessions")
        .select("id")
        .eq("id", str(session_id))
        .eq("user_id", user_id)
        .execute()
    )
    return len(res.data) > 0


# ---------- Message helpers ----------

def insert_message(session_id, role, content):
    """Insert a chat message into a session."""
    supabase.table("messages").insert({
        "session_id": str(session_id),
        "role": role,
        "content": content,
    }).execute()


def get_messages(session_id):
    """Return all messages in a session, oldest first."""
    res = (
        supabase.table("messages")
        .select("id, role, content, created_at")
        .eq("session_id", str(session_id))
        .order("created_at", desc=False)
        .execute()
    )
    return res.data