"""
Authentication dependencies for FastAPI route protection.
Provides get_current_user (any authenticated user) and require_admin (admin only).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from .security import decode_access_token

# FastAPI security scheme — extracts Bearer token from Authorization header
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> dict:
    """
    Dependency: Extract and validate JWT from Authorization header.
    Returns the decoded payload {"sub": username, "role": role, ...}.
    Raises 401 if token is missing, expired, or invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido. Inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada o token inválido. Inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return payload


def require_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency: Ensures the current user has 'admin' role.
    Raises 403 if the user is a 'viewer'.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requiere rol de Administrador para esta operación."
        )
    return current_user


def require_superuser(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency: Ensures the current user is the super administrator (username == 'admin').
    Raises 403 if the user is not 'admin'.
    """
    if current_user.get("sub") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requieren permisos de Super Administrador para esta operación."
        )
    return current_user

