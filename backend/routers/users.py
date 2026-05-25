from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from collections import defaultdict
import time

from ..database import get_db
from ..models import User
from ..schemas import User as UserSchema, UserCreate, UserUpdate, UserLogin
from ..security import hash_password, verify_password, create_access_token
from ..auth import require_admin
from ..services.audit import log_change, create_notification

router = APIRouter(prefix="/users", tags=["Users"])

# In-memory brute-force protection rate limiter: username -> (attempts, lockout_until)
FAILED_LOGIN_ATTEMPTS = defaultdict(lambda: {"attempts": 0, "lockout_until": 0.0})

@router.get("", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    return db.query(User).order_by(User.id).all()

@router.post("", response_model=UserSchema)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    # Check if username already exists
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario '{user_in.username}' ya existe."
        )
    db_user = User(
        username=user_in.username,
        password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Log audit change & notify
    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="CREATE",
        entity="user",
        entity_id=db_user.id,
        new_item=db_user
    )
    create_notification(
        db=db,
        title="👤 Nuevo Usuario Registrado",
        message=f"Se ha registrado el nuevo usuario '{db_user.username}' con rol de '{db_user.role}'.",
        severity="success"
    )
    
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado."
        )
    # Clone user state before update to log differences
    from copy import copy
    old_state = copy(db_user)

    for k, v in user_in.dict(exclude_unset=True).items():
        if v is not None:
            if k == 'password':
                setattr(db_user, k, hash_password(v))
            else:
                setattr(db_user, k, v)
    db.commit()
    db.refresh(db_user)

    # Log audit change
    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="UPDATE",
        entity="user",
        entity_id=db_user.id,
        old_item=old_state,
        new_item=db_user
    )

    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con ID {user_id} no encontrado."
        )
    
    # Do not allow deleting the last admin
    if db_user.role == 'admin':
        admin_count = db.query(User).filter(User.role == 'admin').count()
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede eliminar el último administrador del sistema."
            )

    # Save user info for log before delete
    from copy import copy
    old_state = copy(db_user)

    db.delete(db_user)
    db.commit()

    # Log audit change & notify
    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="DELETE",
        entity="user",
        entity_id=old_state.id,
        old_item=old_state
    )
    create_notification(
        db=db,
        title="🗑️ Usuario Eliminado",
        message=f"El usuario '{old_state.username}' ha sido eliminado del sistema.",
        severity="info"
    )

    return {"message": "Usuario eliminado exitosamente"}

@router.post("/login")
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    now = time.time()
    username = login_in.username.strip().lower()
    
    # 1. Rate Limiting / Brute-force Lockout check
    state = FAILED_LOGIN_ATTEMPTS[username]
    if state["lockout_until"] > now:
        time_left = int(state["lockout_until"] - now)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Cuenta bloqueada temporalmente por exceso de intentos fallidos. Intente de nuevo en {time_left} segundos."
        )
        
    # 2. Database query for the user
    user = db.query(User).filter(User.username == login_in.username).first()
    
    # 3. Handle user verification (secure hash or clean fallback)
    success = False
    role = "viewer"
    resolved_username = login_in.username
    
    if user:
        if verify_password(login_in.password, user.password):
            success = True
            role = user.role
            resolved_username = user.username
    else:
        # Fallback to standard hardcoded credentials to prevent lockouts during setup
        p_clean = login_in.password.strip()
        if (username == 'admin' or username == 'administrador') and (p_clean == 'admin' or p_clean == 'admin2026'):
            success = True
            role = "admin"
        elif (username == 'lector' or username == 'visitante') and (p_clean == 'lector' or p_clean == 'lector2026'):
            success = True
            role = "viewer"

    if not success:
        # Increment failed attempts
        state["attempts"] += 1
        if state["attempts"] >= 5:
            state["lockout_until"] = now + 60.0  # 60 seconds lockout
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Cuenta bloqueada temporalmente por 5 intentos fallidos consecutivos."
            )
        else:
            attempts_left = 5 - state["attempts"]
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Usuario o contraseña incorrectos. Le quedan {attempts_left} intentos antes de bloquear la cuenta."
            )
            
    # Reset attempts on successful login
    FAILED_LOGIN_ATTEMPTS[username] = {"attempts": 0, "lockout_until": 0.0}
    
    # Generate JWT token
    token = create_access_token(resolved_username, role)
    
    return {
        "username": resolved_username,
        "role": role,
        "access_token": token,
        "token_type": "bearer"
    }
