from functools import wraps
from flask import request, jsonify, g
from supabase_client import supabase

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Missing Authorization header"}), 401
        
        try:
            # Format: Bearer <token>
            token = auth_header.split(" ")[1]
            res = supabase.auth.get_user(token)
            
            if not res.user:
                return jsonify({"error": "Invalid or expired token"}), 401
                
            g.user = res.user
        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401
            
        return f(*args, **kwargs)
    
    return decorated
