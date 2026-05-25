import hashlib
import os
import hmac
import jwt
import time
from typing import Optional

# Secret key for JWT signing — in production use an environment variable
JWT_SECRET = os.getenv("JWT_SECRET", "cofimar-control-2026-secret-key-pbkdf2-signed")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 8


def hash_password(password: str) -> str:
    """Hash password using PBKDF2 with HMAC-SHA256 and a random salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"{salt.hex()}:{key.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against a PBKDF2-hashed password, with constant-time equality check."""
    try:
        if ":" not in hashed_password:
            # Support plain text transition safely for fallback
            return password == hashed_password
            
        salt_hex, key_hex = hashed_password.split(':')
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        
        actual_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        
        # Constant-time comparison to prevent timing attacks
        return hmac.compare_digest(actual_key, expected_key)
    except Exception as e:
        print(f"Error in verify_password: {e}")
        return False


def create_access_token(username: str, role: str) -> str:
    """Create a JWT token with username, role, and expiration."""
    payload = {
        "sub": username,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + (JWT_EXPIRATION_HOURS * 3600)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token. Returns payload or None if invalid/expired."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
