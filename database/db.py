import os
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get('DATABASE_URL', 'postgresql://localhost/krishi_officer')

# Connection pool: min 2, max 10 connections.
# This prevents creating a new TCP connection on every request.
_pool = psycopg2.pool.SimpleConnectionPool(2, 10, DB_URL)


def get_db_connection():
    """Get a connection from the pool (non-blocking)."""
    return _pool.getconn()


def release_db_connection(conn):
    """Return a connection back to the pool after use."""
    _pool.putconn(conn)