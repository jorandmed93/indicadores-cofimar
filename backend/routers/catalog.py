from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct
from typing import List, Dict, Any

from ..database import get_db
from ..models import Cycle, Pond

router = APIRouter(prefix="/catalog", tags=["Catalog"])

@router.get("/sectors", response_model=List[str])
def get_sectors(db: Session = Depends(get_db)):
    results = db.query(distinct(Cycle.sector)).filter(Cycle.sector.isnot(None)).all()
    # Flatten list of tuples
    sectors = [r[0] for r in results]
    sectors.sort()
    return sectors

@router.get("/ponds", response_model=List[Dict[str, Any]])
def get_ponds(db: Session = Depends(get_db)):
    ponds = db.query(Pond).order_by(Pond.code).all()
    return [
        {
            "code": p.code,
            "hectares": float(p.hectares or 0),
            "certification": p.certification,
            "sector": p.sector
        } for p in ponds
    ]

@router.get("/aguajes", response_model=List[str])
def get_aguajes(db: Session = Depends(get_db)):
    results = db.query(distinct(Cycle.aguaje)).filter(Cycle.aguaje.isnot(None)).all()
    aguajes = [r[0] for r in results]
    
    # Custom sort for aguajes (AGUAJE 1, AGUAJE 2, etc.)
    try:
        aguajes.sort(key=lambda x: int(x.split()[-1]) if len(x.split()) > 1 else 0)
    except Exception:
        aguajes.sort()
        
    return aguajes

@router.get("/certifications", response_model=List[str])
def get_certifications(db: Session = Depends(get_db)):
    results = db.query(distinct(Cycle.certification)).filter(Cycle.certification.isnot(None)).all()
    certs = [r[0] for r in results]
    certs.sort()
    return certs
