from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from decimal import Decimal

from ..database import get_db
from ..models import Cycle
from ..schemas import SectorSummary, AguajeSummary, PondSummary, MonthSummary, TrendPoint

router = APIRouter(prefix="/summary", tags=["Summary"])

@router.get("/by-sector", response_model=List[SectorSummary])
def get_summary_by_sector(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    aguaje: Optional[str] = Query(None),
    month: Optional[str] = Query(None)
):
    query = db.query(
        Cycle.sector.label("sector"),
        func.avg(Cycle.lbs_ha).label("avg_lbs_ha"),
        func.avg(Cycle.fca).label("avg_fca"),
        func.avg(Cycle.survival_pct).label("avg_survival"),
        func.avg(Cycle.days).label("avg_days"),
        func.count(Cycle.id).label("cycle_count")
    )

    if year is not None:
        query = query.filter(Cycle.year == year)
    if aguaje is not None:
        query = query.filter(Cycle.aguaje == aguaje)
    if month is not None:
        query = query.filter(Cycle.month == month.upper())

    results = query.group_by(Cycle.sector).all()

    response = []
    for r in results:
        if not r.sector:
            continue
        response.append({
            "sector": r.sector,
            "avg_lbs_ha": Decimal(str(r.avg_lbs_ha or 0)),
            "avg_fca": Decimal(str(r.avg_fca or 0)),
            "avg_survival": Decimal(str(r.avg_survival or 0)),
            "avg_days": Decimal(str(r.avg_days or 0)),
            "cycle_count": r.cycle_count
        })
    return response

@router.get("/by-aguaje", response_model=List[AguajeSummary])
def get_summary_by_aguaje(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    sector: Optional[str] = Query(None)
):
    query = db.query(
        Cycle.aguaje.label("aguaje"),
        func.avg(Cycle.lbs_ha).label("avg_lbs_ha"),
        func.avg(Cycle.fca).label("avg_fca"),
        func.avg(Cycle.survival_pct).label("avg_survival"),
        func.count(Cycle.id).label("cycle_count")
    )

    if year is not None:
        query = query.filter(Cycle.year == year)
    if sector is not None:
        query = query.filter(Cycle.sector == sector)

    results = query.group_by(Cycle.aguaje).all()

    response = []
    for r in results:
        if not r.aguaje:
            continue
        response.append({
            "aguaje": r.aguaje,
            "avg_lbs_ha": Decimal(str(r.avg_lbs_ha or 0)),
            "avg_fca": Decimal(str(r.avg_fca or 0)),
            "avg_survival": Decimal(str(r.avg_survival or 0)),
            "cycle_count": r.cycle_count
        })
        
    # Standard string sorting for aguajes
    try:
        response.sort(key=lambda x: int(x["aguaje"].split()[-1]) if len(x["aguaje"].split()) > 1 else 0)
    except Exception:
        pass
        
    return response

@router.get("/by-pond", response_model=List[PondSummary])
def get_summary_by_pond(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    sector: Optional[str] = Query(None),
    month: Optional[str] = Query(None),
    aguaje: Optional[str] = Query(None)
):
    # Aggregates KPIs by pond code (Hoja2 pivot style)
    query = db.query(
        Cycle.pond_code.label("pond_code"),
        func.max(Cycle.pond_name).label("pond_name"),
        func.max(Cycle.sector).label("sector"),
        func.avg(Cycle.lbs_ha).label("avg_lbs_ha"),
        func.avg(Cycle.fca).label("avg_fca"),
        func.avg(Cycle.survival_pct).label("avg_survival"),
        func.avg(Cycle.days).label("avg_days"),
        func.avg(Cycle.gr_harvest_plant).label("avg_gr_plant"),
        func.count(Cycle.id).label("cycle_count")
    )

    if year is not None:
        query = query.filter(Cycle.year == year)
    if sector is not None:
        query = query.filter(Cycle.sector == sector)
    if month is not None:
        query = query.filter(Cycle.month == month.upper())
    if aguaje is not None:
        query = query.filter(Cycle.aguaje == aguaje)

    results = query.group_by(Cycle.pond_code).all()

    response = []
    for r in results:
        if not r.pond_code:
            continue
        response.append({
            "pond_code": r.pond_code,
            "pond_name": r.pond_name or r.pond_code,
            "sector": r.sector or "",
            "avg_lbs_ha": Decimal(str(r.avg_lbs_ha or 0)),
            "avg_fca": Decimal(str(r.avg_fca or 0)),
            "avg_survival": Decimal(str(r.avg_survival or 0)),
            "avg_days": Decimal(str(r.avg_days or 0)),
            "avg_gr_plant": Decimal(str(r.avg_gr_plant or 0)),
            "cycle_count": r.cycle_count
        })
    return response

@router.get("/by-month", response_model=List[MonthSummary])
def get_summary_by_month(
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None),
    sector: Optional[str] = Query(None)
):
    query = db.query(
        Cycle.month.label("month"),
        Cycle.year.label("year"),
        func.avg(Cycle.lbs_ha).label("avg_lbs_ha"),
        func.avg(Cycle.fca).label("avg_fca"),
        func.avg(Cycle.survival_pct).label("avg_survival"),
        func.count(Cycle.id).label("cycle_count")
    )

    if year is not None:
        query = query.filter(Cycle.year == year)
    if sector is not None:
        query = query.filter(Cycle.sector == sector)

    results = query.group_by(Cycle.year, Cycle.month).all()

    response = []
    # Month sort helper
    month_weights = {
        "ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
        "JULIO": 7, "AGOSTO": 8, "SEPTIEMBRE": 9, "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12
    }

    for r in results:
        if not r.month:
            continue
        response.append({
            "month": r.month,
            "year": r.year,
            "avg_lbs_ha": Decimal(str(r.avg_lbs_ha or 0)),
            "avg_fca": Decimal(str(r.avg_fca or 0)),
            "avg_survival": Decimal(str(r.avg_survival or 0)),
            "cycle_count": r.cycle_count
        })

    response.sort(key=lambda x: (x["year"], month_weights.get(x["month"].upper(), 0)))
    return response

@router.get("/trends", response_model=List[TrendPoint])
def get_trends(
    db: Session = Depends(get_db),
    sector: Optional[str] = Query(None),
    pond_code: Optional[str] = Query(None),
    group_by: str = Query("month", regex="^(day|week|month|aguaje)$")
):
    # Groups cycles chronologically to draw high fidelity charts
    if group_by == "day":
        group_expr = Cycle.harvest_date
    elif group_by == "week":
        # Group by year and week
        # Standard fallback for sqlite vs postgres
        group_expr = func.strftime("%Y-W%W", Cycle.harvest_date)
    elif group_by == "aguaje":
        group_expr = Cycle.aguaje
    else:  # month
        group_expr = Cycle.month

    query = db.query(
        group_expr.label("group_key"),
        func.avg(Cycle.lbs_ha).label("avg_lbs_ha"),
        func.avg(Cycle.fca).label("avg_fca"),
        func.avg(Cycle.survival_pct).label("avg_survival"),
        func.count(Cycle.id).label("cycle_count"),
        func.min(Cycle.harvest_date).label("min_date") # used for sorting
    )

    if sector is not None:
        query = query.filter(Cycle.sector == sector)
    if pond_code is not None:
        query = query.filter(Cycle.pond_code == pond_code)

    results = query.group_by(group_expr).all()

    response = []
    for r in results:
        if not r.group_key:
            continue
        response.append({
            "group_key": str(r.group_key),
            "avg_lbs_ha": Decimal(str(r.avg_lbs_ha or 0)),
            "avg_fca": Decimal(str(r.avg_fca or 0)),
            "avg_survival": Decimal(str(r.avg_survival or 0)),
            "cycle_count": r.cycle_count,
            "min_date": r.min_date
        })

    # Sort chronologically by the minimum harvest date in the group
    response.sort(key=lambda x: x["min_date"] or date.min)

    # Clean up response to match Pydantic schema (removing the min_date helper)
    cleaned_response = []
    for x in response:
        cleaned_response.append({
            "group_key": x["group_key"],
            "avg_lbs_ha": x["avg_lbs_ha"],
            "avg_fca": x["avg_fca"],
            "avg_survival": x["avg_survival"],
            "cycle_count": x["cycle_count"]
        })

    return cleaned_response
