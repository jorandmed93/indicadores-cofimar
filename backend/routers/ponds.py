from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ..database import get_db
from ..models import Pond
from ..schemas import Pond as PondSchema, PondCreate

router = APIRouter(prefix="/ponds", tags=["Ponds"])

@router.get("", response_model=List[PondSchema])
def get_ponds(db: Session = Depends(get_db)):
    ponds = db.query(Pond).all()
    sector_chiefs_map = {
        'BARRACUDA': 'GUSTAVO CARRASCO',
        'CATANUDA': 'VICTOR QUINTANA',
        'CHERNA': 'SANTIAGO OBRIEN',
        'DELFIN': 'RONNIE REYES',
        'DORADO': 'JOSE CEDEÑO',
        'GUATO': 'JULIO SANTOS',
        'MANTARRAYA': 'GUSTAVO CARRASCO',
        'MERO': 'RONNIE REYES',
        'PAMPANO': 'GUSTAVO CARRASCO',
        'PARGO ROJO': 'WILMER TORRES',
        'ROBALO': 'VICTOR QUINTANA',
        'TAMBULERO': 'ALFONSO GRUNAUER',
        'TIBURON': 'ALFONSO GRUNAUER',
        'TUNA': 'GUSTAVO CARRASCO',
        'WAHOO': 'JUNIOR ESQUIVEL',
        'COCORA': 'JEFE COCORA',
        'MARIA': 'JEFE MARIA',
        'CHUPADORES': 'JEFE CHUPADORES',
        'SOLEDAD': 'JEFE SOLEDAD'
    }
    for p in ponds:
        if not p.sector_chief:
            sec = (p.sector or '').upper().strip()
            if sec in sector_chiefs_map:
                p.sector_chief = sector_chiefs_map[sec]
    return ponds

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
    
    # Auto-propagate sector chief to other ponds in the same sector
    if db_pond.sector and db_pond.sector_chief:
        db.query(Pond).filter(Pond.sector == db_pond.sector).update({Pond.sector_chief: db_pond.sector_chief})
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
    
    # Auto-propagate sector chief to other ponds in the same sector
    if db_pond.sector and db_pond.sector_chief:
        db.query(Pond).filter(Pond.sector == db_pond.sector).update({Pond.sector_chief: db_pond.sector_chief})
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
