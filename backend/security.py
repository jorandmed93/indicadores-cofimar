import hashlib
import os

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
        return hashlib.compare_digest(actual_key, expected_key)
    except Exception:
        return False
