import json
from decimal import Decimal
from datetime import date, datetime
from sqlalchemy.orm import Session
from ..models import AuditLog, Notification

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super(CustomJSONEncoder, self).default(obj)

def serialize_item(item) -> dict:
    if not item:
        return {}
    res = {}
    for col in item.__table__.columns:
        val = getattr(item, col.name)
        res[col.name] = val
    return res

def log_change(
    db: Session,
    username: str,
    action: str, # 'CREATE', 'UPDATE', 'DELETE'
    entity: str, # 'pond', 'cycle', 'harvest', 'seeding', 'user'
    entity_id: str,
    old_item = None,
    new_item = None
):
    try:
        old_values = json.dumps(serialize_item(old_item), cls=CustomJSONEncoder) if old_item else None
        new_values = json.dumps(serialize_item(new_item), cls=CustomJSONEncoder) if new_item else None
        
        log = AuditLog(
            username=username,
            action=action,
            entity=entity,
            entity_id=str(entity_id),
            old_values=old_values,
            new_values=new_values
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Error logging audit trail: {e}")

def create_notification(
    db: Session,
    title: str,
    message: str,
    severity: str = "info" # 'info', 'warning', 'danger', 'success'
):
    try:
        notif = Notification(
            title=title,
            message=message,
            severity=severity
        )
        db.add(notif)
        db.commit()
    except Exception as e:
        print(f"Error generating notification: {e}")

def check_cycle_thresholds(db: Session, cycle):
    try:
        if cycle.fca and float(cycle.fca) > 1.65:
            create_notification(
                db=db,
                title="⚠️ Alerta: FCA Elevado",
                message=f"La piscina {cycle.pond_code} ha registrado un FCA de {float(cycle.fca):.2f}, superando el límite establecido de 1.65.",
                severity="warning"
            )
        if cycle.survival_pct and 0 < float(cycle.survival_pct) < 50.0:
            create_notification(
                db=db,
                title="🚨 Alerta: Baja Sobrevivencia",
                message=f"La piscina {cycle.pond_code} presenta una sobrevivencia estimada baja del {float(cycle.survival_pct):.1f}%.",
                severity="danger"
            )
    except Exception as e:
        print(f"Error in threshold check: {e}")
