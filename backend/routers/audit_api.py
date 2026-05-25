from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import AuditLog, Notification
from ..auth import get_current_user, require_admin, require_superuser

router = APIRouter(prefix="/audit", tags=["Audit & Notifications"])

@router.get("/logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    username: Optional[str] = Query(None),
    entity: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_superuser)
):
    query = db.query(AuditLog)
    if username:
        query = query.filter(AuditLog.username.ilike(f"%{username}%"))
    if entity:
        query = query.filter(AuditLog.entity == entity)
    if action:
        query = query.filter(AuditLog.action == action)
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    # Format log response
    res = []
    for log in logs:
        res.append({
            "id": log.id,
            "username": log.username,
            "action": log.action,
            "entity": log.entity,
            "entity_id": log.entity_id,
            "old_values": log.old_values,
            "new_values": log.new_values,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        })
    return res

@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)
        
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    res = []
    for n in notifications:
        res.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "severity": n.severity,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None
        })
    return res

@router.put("/notifications/{id}/read")
def mark_notification_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    n = db.query(Notification).filter(Notification.id == id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}

@router.post("/notifications/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db.query(Notification).filter(Notification.is_read == False).update({Notification.is_read: True})
    db.commit()
    return {"message": "All notifications marked as read"}
