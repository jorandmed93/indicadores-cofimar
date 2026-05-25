from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List
import io
import pandas as pd
from datetime import date

from ..database import get_db
from ..models import Cycle
from ..schemas import Cycle as CycleSchema, CycleListResponse

router = APIRouter(prefix="/cycles", tags=["Cycles"])

@router.get("", response_model=CycleListResponse)
def get_cycles(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    aguaje: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    pond_code: Optional[str] = Query(None),
    certification: Optional[str] = Query(None),
    is_closed: Optional[bool] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    min_lbs_ha: Optional[float] = Query(None),
    max_lbs_ha: Optional[float] = Query(None),
    min_fca: Optional[float] = Query(None),
    max_fca: Optional[float] = Query(None),
    min_survival: Optional[float] = Query(None),
    max_survival: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    sort_by: str = Query("harvest_date"),
    sort_dir: str = Query("desc")
):
    query = db.query(Cycle)

    if is_closed is not None:
        query = query.filter(Cycle.is_closed == is_closed)

    # Apply categorical filters
    if year is not None:
        query = query.filter(Cycle.year == year)
    if aguaje is not None:
        query = query.filter(Cycle.aguaje == aguaje)
    if month is not None:
        query = query.filter(Cycle.month == month.upper())
    if sector is not None:
        query = query.filter(Cycle.sector == sector)
    if pond_code is not None:
        query = query.filter(Cycle.pond_code == pond_code)
    if certification is not None:
        query = query.filter(Cycle.certification == certification)

    # Date filters
    if date_from is not None:
        query = query.filter(Cycle.harvest_date >= date_from)
    if date_to is not None:
        query = query.filter(Cycle.harvest_date <= date_to)

    # KPI filters
    if min_lbs_ha is not None:
        query = query.filter(Cycle.lbs_ha >= min_lbs_ha)
    if max_lbs_ha is not None:
        query = query.filter(Cycle.lbs_ha <= max_lbs_ha)
    if min_fca is not None:
        query = query.filter(Cycle.fca >= min_fca)
    if max_fca is not None:
        query = query.filter(Cycle.fca <= max_fca)
    if min_survival is not None:
        query = query.filter(Cycle.survival_pct >= min_survival)
    if max_survival is not None:
        query = query.filter(Cycle.survival_pct <= max_survival)

    # Text search (by pond code or sector chief)
    if search:
        query = query.filter(
            Cycle.pond_code.ilike(f"%{search}%") |
            Cycle.sector_chief.ilike(f"%{search}%") |
            Cycle.pond_name.ilike(f"%{search}%")
        )

    # Total count
    total = query.count()

    # Sort
    sort_col = getattr(Cycle, sort_by, Cycle.harvest_date)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    # Pagination
    offset = (page - 1) * limit
    cycles = query.offset(offset).limit(limit).all()

    pages = (total + limit - 1) // limit

    return {
        "data": cycles,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/export")
def export_cycles(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    aguaje: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    pond_code: Optional[str] = Query(None),
    certification: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    format: str = Query("xlsx", regex="^(xlsx|csv)$")
):
    # Retrieve all matching rows (no pagination)
    query = db.query(Cycle)
    
    if year is not None:
        query = query.filter(Cycle.year == year)
    if aguaje is not None:
        query = query.filter(Cycle.aguaje == aguaje)
    if month is not None:
        query = query.filter(Cycle.month == month.upper())
    if sector is not None:
        query = query.filter(Cycle.sector == sector)
    if pond_code is not None:
        query = query.filter(Cycle.pond_code == pond_code)
    if certification is not None:
        query = query.filter(Cycle.certification == certification)
    if date_from is not None:
        query = query.filter(Cycle.harvest_date >= date_from)
    if date_to is not None:
        query = query.filter(Cycle.harvest_date <= date_to)

    cycles = query.order_by(desc(Cycle.harvest_date)).all()

    # Convert to DataFrame
    data_list = []
    for c in cycles:
        data_list.append({
            "FECHA": c.harvest_date,
            "ID": c.id,
            "AÑO": c.year,
            "AGUAJE": c.aguaje,
            "MES": c.month,
            "CODIGO": c.pond_code,
            "PISCINA": c.pond_name,
            "SECTOR": c.sector,
            "HAS": float(c.hectares or 0),
            "Certificación": c.certification,
            "DIAS": c.days,
            "FECHA DE SIEMBRA": c.seeding_date,
            "PRE": c.pre,
            "PESO SIEMBRA": float(c.seeding_weight or 0),
            "DIAS SECOS": c.dry_days,
            "ANIM SEMBRADOS": c.animals_seeded,
            "DENSIDAD/HA": float(c.density_ha or 0),
            "DENSIDAD M2": float(c.density_m2 or 0),
            "LABORATORIO": c.laboratory,
            "NAUPLIO": c.nauplio,
            "TIPO SIEMBRA": c.seeding_type,
            "LBS RALEO PLANTA": float(c.lbs_trawl_plant or 0),
            "GRAMAJE RALEO PLANTA": float(c.gr_trawl_plant or 0),
            "LIBRAS PLANTA": float(c.lbs_harvest_plant or 0),
            "GRAMOS PLANTA": float(c.gr_harvest_plant or 0),
            "LIBRAS TOTALES": float(c.total_lbs or 0),
            "LBS/HA": float(c.lbs_ha or 0),
            "INCREM": float(c.weekly_increment or 0),
            "SOBREVIVENCIA": float(c.survival_pct or 0),
            "FCA": float(c.fca or 0),
            "BALANCEADO ACUMULADO (LBS)": float(c.feed_lbs or 0),
            "PROVEEDOR BALANCEADO": c.feed_supplier,
            "MODO ALIMENTACION": c.feeding_mode,
            "JEFE DE SECTOR": c.sector_chief
        })

    df = pd.DataFrame(data_list)

    if format == "csv":
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        response = StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = "attachment; filename=indicadores_ciclos.csv"
        return response
    else:
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name="BASE 2026")
        output.seek(0)
        
        response = StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response.headers["Content-Disposition"] = "attachment; filename=indicadores_ciclos.xlsx"
        return response

@router.get("/{id}", response_model=CycleSchema)
def get_cycle_detail(id: int, db: Session = Depends(get_db)):
    cycle = db.query(Cycle).filter(Cycle.id == id).first()
    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cycle with ID {id} not found"
        )
    return cycle

from ..schemas import CycleCreate

@router.post("", response_model=CycleSchema)
def create_cycle(cycle_in: CycleCreate, db: Session = Depends(get_db)):
    db_cycle = Cycle(**cycle_in.dict())
    
    # Run calculation to compute KPIs immediately
    from ..services.kpi_calculator import calc_kpis
    calc_kpis(db_cycle)
    
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    return db_cycle

@router.put("/{id}", response_model=CycleSchema)
def update_cycle(id: int, cycle_in: CycleCreate, db: Session = Depends(get_db)):
    db_cycle = db.query(Cycle).filter(Cycle.id == id).first()
    if not db_cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cycle with ID {id} not found"
        )
    for k, v in cycle_in.dict(exclude_unset=True).items():
        setattr(db_cycle, k, v)
        
    from ..services.kpi_calculator import calc_kpis
    calc_kpis(db_cycle)
    
    db.commit()
    db.refresh(db_cycle)
    return db_cycle

@router.delete("/{id}")
def delete_cycle(id: int, db: Session = Depends(get_db)):
    db_cycle = db.query(Cycle).filter(Cycle.id == id).first()
    if not db_cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cycle with ID {id} not found"
        )
    db.delete(db_cycle)
    db.commit()
    return {"message": "Cycle deleted successfully"}
