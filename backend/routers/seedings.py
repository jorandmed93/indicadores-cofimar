from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, List
from ..database import get_db
from ..models import Seeding
from ..schemas import Seeding as SeedingSchema, SeedingCreate
from ..auth import require_admin
from ..services.audit import log_change, create_notification

router = APIRouter(prefix="/seedings", tags=["Seedings"])

from sqlalchemy import desc

@router.get("", response_model=List[SeedingSchema])
def get_seedings(
    db: Session = Depends(get_db),
    pond_code: Optional[str] = Query(None),
    is_closed: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=1000)
):
    from ..models import Cycle
    query = db.query(Seeding)
    if pond_code:
        query = query.filter(Seeding.pond_code == pond_code)
    
    seedings = query.order_by(desc(Seeding.seeding_date)).all()
    
    result = []
    for s in seedings:
        match_cycle = db.query(Cycle).filter(
            Cycle.pond_code == s.pond_code,
            Cycle.seeding_date == s.seeding_date
        ).first()
        s_closed = match_cycle.is_closed if match_cycle else False
        
        if is_closed is not None:
            if is_closed != s_closed:
                continue
                
        s.is_closed = s_closed
        result.append(s)
        
    return result[:limit]

@router.post("", response_model=SeedingSchema)
def create_seeding(seeding_in: SeedingCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    from ..models import Cycle, Pond
    # 1. Check if there's already an active (open) cycle for this pool
    active_cycle = db.query(Cycle).filter(
        Cycle.pond_code == seeding_in.pond_code,
        Cycle.is_closed == False
    ).first()
    
    if active_cycle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La piscina {seeding_in.pond_code} ya tiene un ciclo activo abierto. Debe registrar la pesca final para cerrar el ciclo actual antes de sembrar de nuevo."
        )
        
    db_seeding = Seeding(**seeding_in.dict())
    db.add(db_seeding)
    db.commit()
    db.refresh(db_seeding)
    
    # 2. Initialize a new open cycle for this pool
    # Retrieve pool information for automatic mapping
    pond = db.query(Pond).filter(Pond.code == seeding_in.pond_code).first()
    hectares = pond.hectares if pond else None
    sector = pond.sector if pond else None
    certification = pond.certification if pond else None
    pond_name = seeding_in.pond_code.split(" ")[1] if " " in seeding_in.pond_code else seeding_in.pond_code
    
    sector_chief = pond.sector_chief if pond else None
    db_cycle = Cycle(
        pond_code=seeding_in.pond_code,
        pond_name=pond_name,
        sector=sector,
        hectares=hectares,
        certification=certification,
        seeding_date=seeding_in.seeding_date,
        animals_seeded=seeding_in.animals,
        seeding_weight=seeding_in.weight_gr,
        laboratory=seeding_in.laboratory,
        nauplio=seeding_in.nauplio,
        aguaje=seeding_in.aguaje,
        dry_days=seeding_in.dry_days,
        is_closed=False,
        sector_chief=sector_chief
    )
    db.add(db_cycle)
    db.commit()

    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="CREATE",
        entity="seeding",
        entity_id=db_seeding.id,
        new_item=db_seeding
    )
    
    create_notification(
        db=db,
        title="🌱 Nueva Siembra Registrada",
        message=f"Se ha sembrado la piscina {db_seeding.pond_code} con {db_seeding.animals:,} larvas en {db_seeding.aguaje}.",
        severity="success"
    )
    
    return db_seeding

@router.put("/{id}", response_model=SeedingSchema)
def update_seeding(id: int, seeding_in: SeedingCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_seeding = db.query(Seeding).filter(Seeding.id == id).first()
    if not db_seeding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seeding with ID {id} not found"
        )
    from copy import copy
    old_state = copy(db_seeding)

    for k, v in seeding_in.dict(exclude_unset=True).items():
        setattr(db_seeding, k, v)
    db.commit()
    db.refresh(db_seeding)

    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="UPDATE",
        entity="seeding",
        entity_id=db_seeding.id,
        old_item=old_state,
        new_item=db_seeding
    )

    return db_seeding

@router.delete("/{id}")
def delete_seeding(id: int, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_seeding = db.query(Seeding).filter(Seeding.id == id).first()
    if not db_seeding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seeding with ID {id} not found"
        )
    from copy import copy
    old_state = copy(db_seeding)

    db.delete(db_seeding)
    db.commit()

    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="DELETE",
        entity="seeding",
        entity_id=old_state.id,
        old_item=old_state
    )

    return {"message": "Seeding deleted successfully"}
