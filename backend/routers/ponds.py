from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Pond
from ..schemas import Pond as PondSchema, PondCreate

router = APIRouter(prefix="/ponds", tags=["Ponds"])

@router.get("", response_model=List[PondSchema])
def get_ponds(db: Session = Depends(get_db)):
    return db.query(Pond).all()

@router.post("", response_model=PondSchema)
def create_pond(pond_in: PondCreate, db: Session = Depends(get_db)):
    # Check if code already exists
    existing = db.query(Pond).filter(Pond.code == pond_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Pond with code {pond_in.code} already exists"
        )
    db_pond = Pond(**pond_in.dict())
    db.add(db_pond)
    db.commit()
    db.refresh(db_pond)
    return db_pond

@router.put("/{code}", response_model=PondSchema)
def update_pond(code: str, pond_in: PondCreate, db: Session = Depends(get_db)):
    db_pond = db.query(Pond).filter(Pond.code == code).first()
    if not db_pond:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pond with code {code} not found"
        )
    for k, v in pond_in.dict(exclude_unset=True).items():
        setattr(db_pond, k, v)
    db.commit()
    db.refresh(db_pond)
    return db_pond

@router.delete("/{code}")
def delete_pond(code: str, db: Session = Depends(get_db)):
    db_pond = db.query(Pond).filter(Pond.code == code).first()
    if not db_pond:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pond with code {code} not found"
        )
    db.delete(db_pond)
    db.commit()
    return {"message": "Pond deleted successfully"}
