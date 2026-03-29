import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://txtvnbjwzlzmqxsqzydn.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4dHZuYmp3emx6bXF4c3F6eWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjA1OTQsImV4cCI6MjA5MDA5NjU5NH0.SwczFmNVvrk15q0bVIhcP7gVVgK7mI4MObcwLmT7HYo")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)