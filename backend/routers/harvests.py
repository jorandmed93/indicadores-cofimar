from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
from datetime import date

from ..database import get_db
from ..models import Harvest
from ..schemas import HarvestListResponse
from ..auth import require_admin
from ..services.audit import log_change, create_notification, check_cycle_thresholds

router = APIRouter(prefix="/harvests", tags=["Harvests"])

@router.get("", response_model=HarvestListResponse)
def get_harvests(
    db: Session = Depends(get_db),
    pond_code: Optional[str] = Query(None),
    activity: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    certification: Optional[str] = Query(None),
    sector_chief: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    sort_by: str = Query("harvest_date"),
    sort_dir: str = Query("desc")
):
    query = db.query(Harvest)

    # Apply filters
    if pond_code is not None and pond_code.strip() != "":
        query = query.filter(Harvest.pond_code.ilike(f"%{pond_code}%"))
    if activity is not None and activity.strip() != "":
        query = query.filter(Harvest.activity == activity.upper())
    if sector is not None and sector.strip() != "":
        query = query.filter(Harvest.sector == sector)
    if month is not None and month.strip() != "":
        query = query.filter(Harvest.month == month.upper())
    if certification is not None and certification.strip() != "":
        query = query.filter(Harvest.certification == certification)
    if sector_chief is not None and sector_chief.strip() != "":
        query = query.filter(Harvest.sector_chief.ilike(f"%{sector_chief}%"))
    if date_from is not None:
        query = query.filter(Harvest.harvest_date >= date_from)
    if date_to is not None:
        query = query.filter(Harvest.harvest_date <= date_to)

    # Total count
    total = query.count()

    # Sort
    sort_col = getattr(Harvest, sort_by, Harvest.harvest_date)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    # Pagination
    offset = (page - 1) * limit
    harvests = query.offset(offset).limit(limit).all()

    pages = (total + limit - 1) // limit

    return {
        "data": harvests,
        "total": total,
        "page": page,
        "pages": pages
    }

from ..schemas import HarvestCreate, Harvest as HarvestSchema

@router.post("", response_model=HarvestSchema)
def create_harvest(harvest_in: HarvestCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    from ..models import Cycle, Pond
    from ..services.kpi_calculator import calc_kpis
    
    db_harvest = Harvest(**harvest_in.dict())
    
    # Calculate month and sector if not provided
    if not db_harvest.sector and db_harvest.pond_code:
        prefix = db_harvest.pond_code[:2].upper()
        from ..services.importer import PREFIX_TO_SECTOR
        db_harvest.sector = PREFIX_TO_SECTOR.get(prefix)
        
    if not db_harvest.month and db_harvest.harvest_date:
        months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
        db_harvest.month = months[db_harvest.harvest_date.month - 1]
        
    # Check if there is an active (open) cycle for this pool
    active_cycle = db.query(Cycle).filter(
        Cycle.pond_code == db_harvest.pond_code,
        Cycle.is_closed == False
    ).first()
    
    if not active_cycle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No hay un ciclo de siembra activo abierto para la piscina {db_harvest.pond_code}. Debe registrar la siembra primero."
        )
        
    # Calculate animals dynamically if gr_plant is provided and > 0
    if db_harvest.gr_plant and db_harvest.gr_plant > 0:
        db_harvest.animals = (float(db_harvest.lbs_plant or 0) * 454.0) / float(db_harvest.gr_plant)
        
    db.add(db_harvest)
    db.commit()
    db.refresh(db_harvest)
    
    # Update active cycle fields based on activity type
    if db_harvest.activity == "RALEO":
        # Sum all raleos registered under this active cycle
        raleos = db.query(Harvest).filter(
            Harvest.pond_code == active_cycle.pond_code,
            Harvest.harvest_date >= active_cycle.seeding_date,
            Harvest.harvest_date <= db_harvest.harvest_date,
            Harvest.activity == "RALEO"
        ).all()
        
        lbs_trawl_farm = sum(float(r.lbs_farm or 0) for r in raleos)
        lbs_trawl_plant = sum(float(r.lbs_plant or 0) for r in raleos)
        animals_trawl = sum(float(r.animals or 0) for r in raleos)
        
        gr_farm_list = [float(r.gr_farm or 0) for r in raleos if (r.gr_farm or 0) > 0]
        gr_plant_list = [float(r.gr_plant or 0) for r in raleos if (r.gr_plant or 0) > 0]
        
        gr_trawl_farm = sum(gr_farm_list) / len(gr_farm_list) if len(gr_farm_list) > 0 else 0.0
        gr_trawl_plant = sum(gr_plant_list) / len(gr_plant_list) if len(gr_plant_list) > 0 else 0.0
        
        active_cycle.lbs_trawl_farm = lbs_trawl_farm
        active_cycle.lbs_trawl_plant = lbs_trawl_plant
        active_cycle.gr_trawl_farm = gr_trawl_farm
        active_cycle.gr_trawl_plant = gr_trawl_plant
        active_cycle.lbs_ha_trawl = lbs_trawl_plant / float(active_cycle.hectares or 1.0)
        active_cycle.animals_trawl = animals_trawl
        db.commit()
        
    elif db_harvest.activity == "PESCA":
        # Closing the active cycle!
        active_cycle.harvest_date = db_harvest.harvest_date
        if active_cycle.seeding_date and db_harvest.harvest_date:
            active_cycle.days = (db_harvest.harvest_date - active_cycle.seeding_date).days
            
        active_cycle.year = db_harvest.harvest_date.year
        active_cycle.month = db_harvest.month
        active_cycle.lbs_harvest_farm = db_harvest.lbs_farm
        active_cycle.lbs_harvest_plant = db_harvest.lbs_plant
        active_cycle.gr_harvest_farm = db_harvest.gr_farm
        active_cycle.gr_harvest_plant = db_harvest.gr_plant
        active_cycle.lbs_ha_harvest = float(db_harvest.lbs_plant or 0) / float(active_cycle.hectares or 1.0)
        active_cycle.animals_harvest = db_harvest.animals
        
        # Pull feed from harvest inputs to close the loop
        active_cycle.feed_lbs = db_harvest.feed_lbs or 0.0
        active_cycle.feed_supplier = db_harvest.feed_supplier
        active_cycle.feeding_mode = db_harvest.feeding_mode or "AUTOMATICA"
        calc_kpis(active_cycle)
        db.commit()

        # Log Cycle Update (Closed)
        log_change(
            db=db,
            username=current_user.get("username", "admin"),
            action="UPDATE",
            entity="cycle",
            entity_id=active_cycle.id,
            new_item=active_cycle
        )
        
        # Notify Cycle closed
        create_notification(
            db=db,
            title="🏁 Ciclo Productivo Cerrado",
            message=f"Se ha completado la cosecha final de la piscina {active_cycle.pond_code}. Total Libras: {int(active_cycle.total_lbs or 0):,} | FCA: {float(active_cycle.fca or 0):.2f}.",
            severity="success"
        )
        
        # Check thresholds for FCA and survival
        check_cycle_thresholds(db, active_cycle)
        
    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="CREATE",
        entity="harvest",
        entity_id=db_harvest.id,
        new_item=db_harvest
    )

    create_notification(
        db=db,
        title="🎣 Registro de Cosecha",
        message=f"Se registró {db_harvest.activity} en piscina {db_harvest.pond_code} con {int(db_harvest.lbs_plant or 0):,} Lbs de planta.",
        severity="info"
    )
        
    return db_harvest

@router.put("/{id}", response_model=HarvestSchema)
def update_harvest(id: int, harvest_in: HarvestCreate, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_harvest = db.query(Harvest).filter(Harvest.id == id).first()
    if not db_harvest:
        raise HTTPException(
            status_code=404,
            detail=f"Harvest with ID {id} not found"
        )
    from copy import copy
    old_state = copy(db_harvest)

    for k, v in harvest_in.dict(exclude_unset=True).items():
        setattr(db_harvest, k, v)
        
    if db_harvest.pond_code:
        prefix = db_harvest.pond_code[:2].upper()
        from ..services.importer import PREFIX_TO_SECTOR
        db_harvest.sector = PREFIX_TO_SECTOR.get(prefix)
        
    if db_harvest.harvest_date:
        months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
        db_harvest.month = months[db_harvest.harvest_date.month - 1]
        
    db.commit()
    db.refresh(db_harvest)

    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="UPDATE",
        entity="harvest",
        entity_id=db_harvest.id,
        old_item=old_state,
        new_item=db_harvest
    )

    return db_harvest

@router.delete("/{id}")
def delete_harvest(id: int, db: Session = Depends(get_db), current_user: dict = Depends(require_admin)):
    db_harvest = db.query(Harvest).filter(Harvest.id == id).first()
    if not db_harvest:
        raise HTTPException(
            status_code=404,
            detail=f"Harvest with ID {id} not found"
        )
    from copy import copy
    old_state = copy(db_harvest)

    db.delete(db_harvest)
    db.commit()

    log_change(
        db=db,
        username=current_user.get("username", "admin"),
        action="DELETE",
        entity="harvest",
        entity_id=old_state.id,
        old_item=old_state
    )

    return {"message": "Harvest deleted successfully"}
