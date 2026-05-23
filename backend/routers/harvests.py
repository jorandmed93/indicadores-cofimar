from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
from datetime import date

from ..database import get_db
from ..models import Harvest
from ..schemas import HarvestListResponse

router = APIRouter(prefix="/harvests", tags=["Harvests"])

@router.get("", response_model=HarvestListResponse)
def get_harvests(
    db: Session = Depends(get_db),
    pond_code: Optional[str] = Query(None),
    activity: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    sort_by: str = Query("harvest_date"),
    sort_dir: str = Query("desc")
):
    query = db.query(Harvest)

    # Apply filters
    if pond_code is not None:
        query = query.filter(Harvest.pond_code == pond_code)
    if activity is not None:
        query = query.filter(Harvest.activity == activity.upper())
    if sector is not None:
        query = query.filter(Harvest.sector == sector)
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
def create_harvest(harvest_in: HarvestCreate, db: Session = Depends(get_db)):
    db_harvest = Harvest(**harvest_in.dict())
    
    # Calculate month and sector if not provided
    if not db_harvest.sector and db_harvest.pond_code:
        prefix = db_harvest.pond_code[:2].upper()
        from ..services.importer import PREFIX_TO_SECTOR
        db_harvest.sector = PREFIX_TO_SECTOR.get(prefix)
        
    if not db_harvest.month and db_harvest.harvest_date:
        months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"]
        db_harvest.month = months[db_harvest.harvest_date.month - 1]
        
    db.add(db_harvest)
    db.commit()
    db.refresh(db_harvest)
    return db_harvest

@router.put("/{id}", response_model=HarvestSchema)
def update_harvest(id: int, harvest_in: HarvestCreate, db: Session = Depends(get_db)):
    db_harvest = db.query(Harvest).filter(Harvest.id == id).first()
    if not db_harvest:
        raise HTTPException(
            status_code=404,
            detail=f"Harvest with ID {id} not found"
        )
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
    return db_harvest

@router.delete("/{id}")
def delete_harvest(id: int, db: Session = Depends(get_db)):
    db_harvest = db.query(Harvest).filter(Harvest.id == id).first()
    if not db_harvest:
        raise HTTPException(
            status_code=404,
            detail=f"Harvest with ID {id} not found"
        )
    db.delete(db_harvest)
    db.commit()
    return {"message": "Harvest deleted successfully"}
