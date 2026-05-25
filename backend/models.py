from sqlalchemy import Column, Integer, String, Date, Numeric, DateTime, ForeignKey, func, Boolean
from .database import Base

class Pond(Base):
    __tablename__ = "ponds"

    code = Column(String(20), primary_key=True, index=True)
    sector = Column(String(50), nullable=True)
    hectares = Column(Numeric(8, 2), nullable=True)
    certification = Column(String(30), nullable=True)
    sector_chief = Column(String(100), nullable=True)

class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    harvest_date = Column(Date, nullable=True)
    year = Column(Integer, nullable=True)
    aguaje = Column(String(20), nullable=True)
    month = Column(String(20), nullable=True)
    pond_code = Column(String(20), index=True, nullable=False)
    pond_name = Column(String(50), nullable=True)
    sector = Column(String(50), nullable=True)
    hectares = Column(Numeric(8, 2), nullable=True)
    certification = Column(String(30), nullable=True)
    days = Column(Integer, nullable=True)
    seeding_date = Column(Date, nullable=True)
    pre = Column(String(30), nullable=True)
    seeding_weight = Column(Numeric(8, 3), nullable=True)
    dry_days = Column(Integer, nullable=True)
    animals_seeded = Column(Integer, nullable=True)
    density_ha = Column(Numeric(12, 2), nullable=True)
    density_m2 = Column(Numeric(8, 4), nullable=True)
    laboratory = Column(String(100), nullable=True)
    nauplio = Column(String(100), nullable=True)
    seeding_type = Column(String(20), nullable=True)

    # Raleos (Harvests before final pesca)
    lbs_trawl_farm = Column(Numeric(12, 2), nullable=True)
    lbs_trawl_plant = Column(Numeric(12, 2), nullable=True)
    gr_trawl_farm = Column(Numeric(8, 3), nullable=True)
    gr_trawl_plant = Column(Numeric(8, 3), nullable=True)
    lbs_ha_trawl = Column(Numeric(12, 4), nullable=True)
    animals_trawl = Column(Numeric(14, 2), nullable=True)

    # Liquidación (Final Pesca)
    lbs_harvest_farm = Column(Numeric(12, 2), nullable=True)
    lbs_harvest_plant = Column(Numeric(12, 2), nullable=True)
    gr_harvest_farm = Column(Numeric(8, 3), nullable=True)
    gr_harvest_plant = Column(Numeric(8, 3), nullable=True)
    lbs_ha_harvest = Column(Numeric(12, 4), nullable=True)
    animals_harvest = Column(Numeric(14, 2), nullable=True)

    # Resultados Consolidados
    total_lbs = Column(Numeric(14, 2), nullable=True)
    total_animals = Column(Numeric(14, 2), nullable=True)
    lbs_ha = Column(Numeric(12, 4), nullable=True)  # KPI Principal
    weekly_increment = Column(Numeric(8, 4), nullable=True)
    lbs_ha_day = Column(Numeric(12, 6), nullable=True)
    survival_pct = Column(Numeric(8, 4), nullable=True)
    feed_lbs = Column(Numeric(14, 2), nullable=True)
    kg_ha = Column(Numeric(12, 4), nullable=True)
    fca = Column(Numeric(8, 4), nullable=True)  # KPI Principal
    feed_supplier = Column(String(30), nullable=True)
    feeding_mode = Column(String(20), nullable=True)

    # Diferencias (QC)
    diff_trawl_lbs = Column(Numeric(12, 2), nullable=True)
    diff_harvest_lbs = Column(Numeric(12, 2), nullable=True)
    diff_trawl_gr = Column(Numeric(8, 3), nullable=True)
    diff_harvest_gr = Column(Numeric(8, 3), nullable=True)

    # Responsable
    sector_chief = Column(String(100), nullable=True)
    is_closed = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Harvest(Base):
    __tablename__ = "harvests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pond_code = Column(String(20), index=True, nullable=True)
    activity = Column(String(20), nullable=True)  # PESCA / RALEO
    harvest_date = Column(Date, nullable=True)
    sector = Column(String(50), nullable=True)
    pond_name = Column(String(50), nullable=True)
    sector_chief = Column(String(100), nullable=True)
    animals = Column(Numeric(14, 2), nullable=True)
    lbs_farm = Column(Numeric(12, 2), nullable=True)
    gr_farm = Column(Numeric(8, 3), nullable=True)
    lbs_plant = Column(Numeric(12, 2), nullable=True)
    gr_plant = Column(Numeric(8, 3), nullable=True)
    month = Column(String(20), nullable=True)
    certification = Column(String(30), nullable=True)
    
    # Alimentación para pesca final y cálculo de FCA
    feed_lbs = Column(Numeric(14, 2), nullable=True)
    feed_supplier = Column(String(30), nullable=True)
    feeding_mode = Column(String(20), nullable=True)

class Seeding(Base):
    __tablename__ = "seedings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pond_code = Column(String(20), index=True, nullable=True)
    aguaje = Column(String(20), nullable=True)
    seeding_date = Column(Date, nullable=True)
    transfer_date = Column(Date, nullable=True)
    animals = Column(Integer, nullable=True)
    ablation = Column(String(30), nullable=True)
    nauplio = Column(String(100), nullable=True)
    laboratory = Column(String(100), nullable=True)
    survival_pct = Column(Numeric(8, 4), nullable=True)
    pre_criadero = Column(String(50), nullable=True)
    weight_gr = Column(Numeric(8, 3), nullable=True)
    dry_days = Column(Integer, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False) # 'admin' or 'viewer'

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), nullable=False)
    action = Column(String(20), nullable=False) # 'CREATE', 'UPDATE', 'DELETE'
    entity = Column(String(50), nullable=False) # 'pond', 'cycle', 'harvest', 'seeding', 'user'
    entity_id = Column(String(50), nullable=False)
    old_values = Column(String, nullable=True) # JSON string
    new_values = Column(String, nullable=True) # JSON string
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(String(20), nullable=False, default="info") # 'info', 'warning', 'danger', 'success'
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

