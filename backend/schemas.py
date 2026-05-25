from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List
from decimal import Decimal

# Ponds
class PondBase(BaseModel):
    code: str
    sector: Optional[str] = None
    hectares: Optional[Decimal] = None
    certification: Optional[str] = None
    sector_chief: Optional[str] = None

class PondCreate(PondBase):
    pass

class Pond(PondBase):
    class Config:
        from_attributes = True

# Harvests
class HarvestBase(BaseModel):
    pond_code: Optional[str] = None
    activity: Optional[str] = None
    harvest_date: Optional[date] = None
    sector: Optional[str] = None
    pond_name: Optional[str] = None
    sector_chief: Optional[str] = None
    animals: Optional[Decimal] = None
    lbs_farm: Optional[Decimal] = None
    gr_farm: Optional[Decimal] = None
    lbs_plant: Optional[Decimal] = None
    gr_plant: Optional[Decimal] = None
    month: Optional[str] = None
    certification: Optional[str] = None
    feed_lbs: Optional[Decimal] = None
    feed_supplier: Optional[str] = None
    feeding_mode: Optional[str] = None

class HarvestCreate(HarvestBase):
    pass

class Harvest(HarvestBase):
    id: int
    class Config:
        from_attributes = True

# Seedings
class SeedingBase(BaseModel):
    pond_code: Optional[str] = None
    aguaje: Optional[str] = None
    seeding_date: Optional[date] = None
    transfer_date: Optional[date] = None
    animals: Optional[int] = None
    ablation: Optional[str] = None
    nauplio: Optional[str] = None
    laboratory: Optional[str] = None
    survival_pct: Optional[Decimal] = None
    pre_criadero: Optional[str] = None
    weight_gr: Optional[Decimal] = None
    dry_days: Optional[int] = None

class SeedingCreate(SeedingBase):
    pass

class Seeding(SeedingBase):
    id: int
    is_closed: Optional[bool] = None
    class Config:
        from_attributes = True

# Cycles
class CycleBase(BaseModel):
    harvest_date: Optional[date] = None
    year: Optional[int] = None
    aguaje: Optional[str] = None
    month: Optional[str] = None
    pond_code: str
    is_closed: Optional[bool] = True
    pond_name: Optional[str] = None
    sector: Optional[str] = None
    hectares: Optional[Decimal] = None
    certification: Optional[str] = None
    days: Optional[int] = None
    seeding_date: Optional[date] = None
    pre: Optional[str] = None
    seeding_weight: Optional[Decimal] = None
    dry_days: Optional[int] = None
    animals_seeded: Optional[int] = None
    density_ha: Optional[Decimal] = None
    density_m2: Optional[Decimal] = None
    laboratory: Optional[str] = None
    nauplio: Optional[str] = None
    seeding_type: Optional[str] = None

    lbs_trawl_farm: Optional[Decimal] = None
    lbs_trawl_plant: Optional[Decimal] = None
    gr_trawl_farm: Optional[Decimal] = None
    gr_trawl_plant: Optional[Decimal] = None
    lbs_ha_trawl: Optional[Decimal] = None
    animals_trawl: Optional[Decimal] = None

    lbs_harvest_farm: Optional[Decimal] = None
    lbs_harvest_plant: Optional[Decimal] = None
    gr_harvest_farm: Optional[Decimal] = None
    gr_harvest_plant: Optional[Decimal] = None
    lbs_ha_harvest: Optional[Decimal] = None
    animals_harvest: Optional[Decimal] = None

    total_lbs: Optional[Decimal] = None
    total_animals: Optional[Decimal] = None
    lbs_ha: Optional[Decimal] = None
    weekly_increment: Optional[Decimal] = None
    lbs_ha_day: Optional[Decimal] = None
    survival_pct: Optional[Decimal] = None
    feed_lbs: Optional[Decimal] = None
    kg_ha: Optional[Decimal] = None
    fca: Optional[Decimal] = None
    feed_supplier: Optional[str] = None
    feeding_mode: Optional[str] = None

    diff_trawl_lbs: Optional[Decimal] = None
    diff_harvest_lbs: Optional[Decimal] = None
    diff_trawl_gr: Optional[Decimal] = None
    diff_harvest_gr: Optional[Decimal] = None

    sector_chief: Optional[str] = None

class CycleCreate(CycleBase):
    pass

class Cycle(CycleBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Pagination lists
class CycleListResponse(BaseModel):
    data: List[Cycle]
    total: int
    page: int
    pages: int

class HarvestListResponse(BaseModel):
    data: List[Harvest]
    total: int
    page: int
    pages: int

# Summaries
class SectorSummary(BaseModel):
    sector: str
    avg_lbs_ha: Decimal
    avg_fca: Decimal
    avg_survival: Decimal
    avg_days: Decimal
    cycle_count: int

class AguajeSummary(BaseModel):
    aguaje: str
    avg_lbs_ha: Decimal
    avg_fca: Decimal
    avg_survival: Decimal
    cycle_count: int

class PondSummary(BaseModel):
    pond_code: str
    pond_name: str
    sector: str
    avg_lbs_ha: Decimal
    avg_fca: Decimal
    avg_survival: Decimal
    avg_days: Decimal
    avg_gr_plant: Decimal
    cycle_count: int

class MonthSummary(BaseModel):
    month: str
    year: int
    avg_lbs_ha: Decimal
    avg_fca: Decimal
    avg_survival: Decimal
    cycle_count: int

class TrendPoint(BaseModel):
    group_key: str  # day, week, month, or aguaje
    avg_lbs_ha: Decimal
    avg_fca: Decimal
    avg_survival: Decimal
    cycle_count: int

class ImportResponse(BaseModel):
    imported_cycles: int
    imported_harvests: int
    imported_seedings: int
    imported_ponds: int
    errors: List[str]
