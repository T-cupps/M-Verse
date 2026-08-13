import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

DB_PATH = Path(__file__).parent.parent / "database.sqlite"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize the SQLite database schema."""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                language_preference TEXT,
                facts TEXT,
                last_interaction TEXT
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS escalations (
                escalation_id TEXT PRIMARY KEY,
                who_needs_help TEXT NOT NULL,
                what_happened TEXT NOT NULL,
                checked_details TEXT,
                urgency TEXT NOT NULL,
                language TEXT NOT NULL,
                preferred_followup TEXT NOT NULL,
                status TEXT DEFAULT 'OPEN',
                created_at TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS calls (
                call_id TEXT PRIMARY KEY,
                room_name TEXT,
                status TEXT NOT NULL,
                call_type TEXT NOT NULL,
                exercise_completed INTEGER DEFAULT 0,
                started_at TEXT NOT NULL,
                ended_at TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL
            );
            """
        )
        conn.commit()


def save_escalation(
    who_needs_help: str,
    what_happened: str,
    checked_details: str,
    urgency: str,
    language: str,
    preferred_followup: str,
) -> dict[str, Any]:
    """Create a human help escalation record in SQLite database."""
    init_db()
    escalation_id = f"ESC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    created_at = datetime.now().isoformat()

    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO escalations (
                escalation_id, who_needs_help, what_happened, checked_details,
                urgency, language, preferred_followup, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
            """,
            (
                escalation_id,
                who_needs_help,
                what_happened,
                checked_details,
                urgency,
                language,
                preferred_followup,
                created_at,
            ),
        )
        conn.commit()

    return {
        "escalation_id": escalation_id,
        "who_needs_help": who_needs_help,
        "what_happened": what_happened,
        "checked_details": checked_details,
        "urgency": urgency,
        "language": language,
        "preferred_followup": preferred_followup,
        "status": "OPEN",
        "created_at": created_at,
    }


def get_escalations() -> list[dict[str, Any]]:
    """Retrieve all open human help escalation requests."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT escalation_id, who_needs_help, what_happened, checked_details,
                   urgency, language, preferred_followup, status, created_at
            FROM escalations
            ORDER BY created_at DESC
            """
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_user(user_id_or_name: str) -> Optional[dict[str, Any]]:
    """Lookup a user by user_id or exact/case-insensitive name match."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT user_id, name, language_preference, facts, last_interaction
            FROM users
            WHERE LOWER(user_id) = LOWER(?) OR LOWER(name) = LOWER(?)
            LIMIT 1
            """,
            (user_id_or_name, user_id_or_name),
        )
        row = cursor.fetchone()
        if not row:
            return None

        facts_data = {}
        if row["facts"]:
            try:
                facts_data = json.loads(row["facts"])
            except json.JSONDecodeError:
                facts_data = {}

        return {
            "user_id": row["user_id"],
            "name": row["name"],
            "language_preference": row["language_preference"] or "English",
            "facts": facts_data,
            "last_interaction": row["last_interaction"],
        }


def save_user(
    user_id: str,
    name: str,
    language_preference: str = "English",
    current_level: str = "",
    topics_covered: str = "",
    mistakes_they_keep_making: str = "",
) -> dict[str, Any]:
    """Save or update user details and facts in SQLite."""
    init_db()

    # Check existing facts to merge if already present
    existing = get_user(user_id) or {}
    existing_facts = existing.get("facts", {})

    if current_level:
        existing_facts["current_level"] = current_level
    if topics_covered:
        existing_facts["topics_covered"] = topics_covered
    if mistakes_they_keep_making:
        existing_facts["mistakes_they_keep_making"] = mistakes_they_keep_making

    now_iso = datetime.now().isoformat()
    facts_json = json.dumps(existing_facts)

    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO users (user_id, name, language_preference, facts, last_interaction)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                name = excluded.name,
                language_preference = excluded.language_preference,
                facts = excluded.facts,
                last_interaction = excluded.last_interaction
            """,
            (user_id, name, language_preference, facts_json, now_iso),
        )
        conn.commit()

    return {
        "user_id": user_id,
        "name": name,
        "language_preference": language_preference,
        "facts": existing_facts,
        "last_interaction": now_iso,
    }


def save_call_record(
    call_id: str,
    room_name: str,
    status: str,
    call_type: str,
    exercise_completed: bool,
    started_at: str,
    ended_at: str,
    duration_seconds: int,
) -> dict[str, Any]:
    """Save call outcome record in SQLite database."""
    init_db()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO calls (
                call_id, room_name, status, call_type, exercise_completed,
                started_at, ended_at, duration_seconds
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(call_id) DO UPDATE SET
                status = excluded.status,
                exercise_completed = excluded.exercise_completed,
                ended_at = excluded.ended_at,
                duration_seconds = excluded.duration_seconds
            """,
            (
                call_id,
                room_name,
                status,
                call_type,
                1 if exercise_completed else 0,
                started_at,
                ended_at,
                duration_seconds,
            ),
        )
        conn.commit()

    return {
        "call_id": call_id,
        "room_name": room_name,
        "status": status,
        "call_type": call_type,
        "exercise_completed": exercise_completed,
        "started_at": started_at,
        "ended_at": ended_at,
        "duration_seconds": duration_seconds,
    }


def get_call_analytics() -> dict[str, Any]:
    """Retrieve call metrics: total_calls, successful_calls, failed_calls, and recent call list."""
    init_db()
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM calls")
        total_calls = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM calls WHERE status = 'SUCCESS'")
        successful_calls = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM calls WHERE status = 'FAILED'")
        failed_calls = cursor.fetchone()[0] or 0

        cursor.execute(
            """
            SELECT call_id, room_name, status, call_type, exercise_completed,
                   started_at, ended_at, duration_seconds
            FROM calls
            ORDER BY started_at DESC
            LIMIT 50
            """
        )
        rows = cursor.fetchall()

        return {
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "failed_calls": failed_calls,
            "recent_calls": [dict(row) for row in rows],
        }


# Automatically ensure DB tables exist on import
init_db()
