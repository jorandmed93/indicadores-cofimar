from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional, List
from ..database import get_db
from ..models import Seeding
from ..schemas import Seeding as SeedingSchema, SeedingCreate

router = APIRouter(prefix="/seedings", tags=["Seedings"])

@router.get("", response_model=List[SeedingSchema])
def get_seedings(
    db: Session = Depends(get_db),
    pond_code: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    query = db.query(Seeding)
    if pond_code:
        query = query.filter(Seeding.pond_code == pond_code)
    return query.limit(limit).all()

@router.post("", response_model=SeedingSchema)
def create_seeding(seeding_in: SeedingCreate, db: Session = Depends(get_db)):
    db_seeding = Seeding(**seeding_in.dict())
    db.add(db_seeding)
    db.commit()
    db.refresh(db_seeding)
    return db_seeding

@router.put("/{id}", response_model=SeedingSchema)
def update_seeding(id: int, seeding_in: SeedingCreate, db: Session = Depends(get_db)):
    db_seeding = db.query(Seeding).filter(Seeding.id == id).first()
    if not db_seeding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seeding with ID {id} not found"
        )
    for k, v in seeding_in.dict(exclude_unset=True).items():
        setattr(db_seeding, k, v)
    db.commit()
    db.refresh(db_seeding)
    return db_seeding

@router.delete("/{id}")
def delete_seeding(id: int, db: Session = Depends(get_db)):
    db_seeding = db.query(Seeding).filter(Seeding.id == id).first()
    if not db_seeding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seeding with ID {id} not found"
        )
    db.delete(db_seeding)
    db.commit()
    return {"message": "Seeding deleted successfully"}
