import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Pond, User
from .routers import cycles, summary, harvests, catalog, import_api, ponds, seedings, users, audit_api

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-upgrade database schema with dynamic columns if not present
try:
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    # Check harvests columns
    harvests_cols = [col['name'] for col in inspector.get_columns('harvests')]
    if 'feed_lbs' not in harvests_cols:
        print("Migración: Agregando columnas de alimentación a la tabla 'harvests'...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE harvests ADD COLUMN feed_lbs NUMERIC(14, 2)"))
            conn.execute(text("ALTER TABLE harvests ADD COLUMN feed_supplier VARCHAR(30)"))
            conn.execute(text("ALTER TABLE harvests ADD COLUMN feeding_mode VARCHAR(20)"))
            
    # Check seedings columns
    seedings_cols = [col['name'] for col in inspector.get_columns('seedings')]
    if 'dry_days' not in seedings_cols:
        print("Migración: Agregando columna 'dry_days' a la tabla 'seedings'...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE seedings ADD COLUMN dry_days INTEGER DEFAULT 0"))

    # Check ponds columns
    ponds_cols = [col['name'] for col in inspector.get_columns('ponds')]
    if 'sector_chief' not in ponds_cols:
        print("Migración: Agregando columna 'sector_chief' a la tabla 'ponds'...")
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE ponds ADD COLUMN sector_chief VARCHAR(100)"))

    # Check cycles columns
    cycles_cols = [col['name'] for col in inspector.get_columns('cycles')]
    if 'is_closed' not in cycles_cols:
        print("Migración: Agregando columna 'is_closed' a la tabla 'cycles'...")
        with engine.begin() as conn:
            try:
                conn.execute(text("ALTER TABLE cycles ADD COLUMN is_closed BOOLEAN DEFAULT TRUE"))
            except Exception:
                conn.execute(text("ALTER TABLE cycles ADD COLUMN is_closed BOOLEAN DEFAULT 1"))
    
    # Make sure all existing historical cycles have is_closed = True
    db = SessionLocal()
    from .models import Cycle, Pond
    open_historical = db.query(Cycle).filter(Cycle.is_closed.is_(None)).all()
    if len(open_historical) > 0:
        for c in open_historical:
            c.is_closed = True
        db.commit()

    # Auto-heal existing pools with missing sector chief values
    pools_without_chief = db.query(Pond).filter((Pond.sector_chief == None) | (Pond.sector_chief == '')).all()
    if len(pools_without_chief) > 0:
        print(f"Migración: Auto-asignando jefes de sector a {len(pools_without_chief)} piscinas...")
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
        for p in pools_without_chief:
            sec = (p.sector or '').upper().strip()
            if sec in sector_chiefs_map:
                p.sector_chief = sector_chiefs_map[sec]
        db.commit()
    db.close()
    print("Migración de base de datos completada.")
except Exception as e:
    print(f"Nota de migración: {e}")

# Auto-seed if database is empty
try:
    db = SessionLocal()
    if db.query(Pond).count() == 0:
        print("Base de datos vacía. Buscando archivo Excel para sembrar datos...")
        from .services.importer import import_excel_file
        # Look for the Excel file in common locations
        possible_paths = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "BASE INDICADORES 2026.xlsm"),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "BASE INDICADORES 2026.xlsm"),
            "BASE INDICADORES 2026.xlsm",
        ]
        excel_path = None
        for p in possible_paths:
            if os.path.exists(p):
                excel_path = os.path.abspath(p)
                break
        
        if excel_path:
            print(f"Importando datos desde: {excel_path}")
            results = import_excel_file(excel_path, db)
            print(f"Importación completada: {results.get('imported_cycles', 0)} ciclos, {results.get('imported_ponds', 0)} piscinas")
        else:
            print("No se encontró archivo Excel. Usa la interfaz de 'Cargar Datos' para importar.")
    else:
        print(f"Base de datos OK: {db.query(Pond).count()} piscinas registradas.")
    db.close()
except Exception as e:
    print(f"Nota al verificar base de datos: {e}")

# Auto-seed default users if empty
try:
    db = SessionLocal()
    from .models import User
    from .security import hash_password
    if db.query(User).count() == 0:
        print("Migración: Creando usuarios administradores y lectores por defecto con contraseñas seguras...")
        admin = User(username="admin", password=hash_password("admin"), role="admin")
        lector = User(username="lector", password=hash_password("lector"), role="viewer")
        db.add(admin)
        db.add(lector)
        db.commit()
        print("Migración: Usuarios por defecto creados.")
    db.close()
except Exception as e:
    print(f"Nota al verificar tabla de usuarios: {e}")

# Auto-upgrade/heal cycle records from seedings
try:
    db = SessionLocal()
    from .models import Seeding, Cycle, Pond, Harvest
    from .services.kpi_calculator import calc_kpis
    all_seedings = db.query(Seeding).all()
    reconstructed_count = 0
    for s in all_seedings:
        # Check if a cycle already exists for this pond and seeding date
        if s.seeding_date is None or s.pond_code is None:
            continue
        cycle = db.query(Cycle).filter(
            Cycle.pond_code == s.pond_code,
            Cycle.seeding_date == s.seeding_date
        ).first()
        
        if not cycle:
            pond = db.query(Pond).filter(Pond.code == s.pond_code).first()
            hectares = pond.hectares if pond else None
            sector = pond.sector if pond else None
            certification = pond.certification if pond else None
            pond_name = s.pond_code.split(" ")[1] if " " in s.pond_code else s.pond_code
            
            # Check if there is a PESCA after this seeding date
            pesca = db.query(Harvest).filter(
                Harvest.pond_code == s.pond_code,
                Harvest.harvest_date >= s.seeding_date,
                Harvest.activity == 'PESCA'
            ).order_by(Harvest.harvest_date.asc()).first()
            
            is_closed = pesca is not None
            harvest_date = pesca.harvest_date if pesca else None
            
            # Sum any raleos
            raleos_query = db.query(Harvest).filter(
                Harvest.pond_code == s.pond_code,
                Harvest.harvest_date >= s.seeding_date,
                Harvest.activity == 'RALEO'
            )
            if harvest_date:
                raleos_query = raleos_query.filter(Harvest.harvest_date <= harvest_date)
            raleos = raleos_query.all()
            
            lbs_trawl_farm = sum(float(r.lbs_farm or 0) for r in raleos) if raleos else 0.0
            lbs_trawl_plant = sum(float(r.lbs_plant or 0) for r in raleos) if raleos else 0.0
            animals_trawl = sum(float(r.animals or 0) for r in raleos) if raleos else 0.0
            
            gr_farm_list = [float(r.gr_farm or 0) for r in raleos if (r.gr_farm or 0) > 0]
            gr_plant_list = [float(r.gr_plant or 0) for r in raleos if (r.gr_plant or 0) > 0]
            gr_trawl_farm = sum(gr_farm_list) / len(gr_farm_list) if len(gr_farm_list) > 0 else 0.0
            gr_trawl_plant = sum(gr_plant_list) / len(gr_plant_list) if len(gr_plant_list) > 0 else 0.0
            
            db_cycle = Cycle(
                pond_code=s.pond_code,
                pond_name=pond_name,
                sector=sector,
                hectares=hectares,
                certification=certification,
                seeding_date=s.seeding_date,
                animals_seeded=s.animals,
                seeding_weight=s.weight_gr,
                laboratory=s.laboratory,
                nauplio=s.nauplio,
                aguaje=s.aguaje,
                dry_days=s.dry_days,
                is_closed=is_closed,
                harvest_date=harvest_date,
                lbs_trawl_farm=lbs_trawl_farm,
                lbs_trawl_plant=lbs_trawl_plant,
                gr_trawl_farm=gr_trawl_farm,
                gr_trawl_plant=gr_trawl_plant,
                lbs_ha_trawl=lbs_trawl_plant / float(hectares or 1.0),
                animals_trawl=animals_trawl,
                sector_chief=pond.sector_chief if pond else None
            )
            
            if pesca:
                db_cycle.lbs_harvest_farm = pesca.lbs_farm
                db_cycle.lbs_harvest_plant = pesca.lbs_plant
                db_cycle.gr_harvest_farm = pesca.gr_farm
                db_cycle.gr_harvest_plant = pesca.gr_plant
                db_cycle.lbs_ha_harvest = float(pesca.lbs_plant or 0) / float(hectares or 1.0)
                db_cycle.animals_harvest = pesca.animals
                db_cycle.feed_lbs = pesca.feed_lbs or 0.0
                db_cycle.feed_supplier = pesca.feed_supplier
                db_cycle.feeding_mode = pesca.feeding_mode or "AUTOMATICA"
                if s.seeding_date and pesca.harvest_date:
                    db_cycle.days = (pesca.harvest_date - s.seeding_date).days
                db_cycle.year = pesca.harvest_date.year
                db_cycle.month = pesca.month
                calc_kpis(db_cycle)
                
            db.add(db_cycle)
            reconstructed_count += 1
            
    if reconstructed_count > 0:
        db.commit()
        print(f"Self-healing: Reconstruidos {reconstructed_count} ciclos de acuicultura faltantes desde Siembras.")
    else:
        print("Autocuración de ciclos: Todos los registros de siembra tienen su ciclo correspondiente.")
        
    # Database cleanup: delete duplicate active cycles (is_closed == False), keeping only the newest one per pool
    cleanup_count = 0
    try:
        active_cycles = db.query(Cycle).filter(Cycle.is_closed == False).all()
        by_pond = {}
        for c in active_cycles:
            if c.pond_code not in by_pond:
                by_pond[c.pond_code] = []
            by_pond[c.pond_code].append(c)
            
        for p_code, cycles_list in by_pond.items():
            if len(cycles_list) > 1:
                # Sort cycles by ID descending (newest first)
                cycles_list.sort(key=lambda x: x.id, reverse=True)
                to_delete = cycles_list[1:]
                for c_del in to_delete:
                    db.delete(c_del)
                    cleanup_count += 1
        if cleanup_count > 0:
            db.commit()
            print(f"Cleanup: Eliminados {cleanup_count} ciclos duplicados activos sin usar.")
            
        # Check and correct survival_pct decimal format in existing Seeding and Cycle records
        from .models import Seeding
        seedings_to_fix = db.query(Seeding).filter(Seeding.survival_pct > 0, Seeding.survival_pct <= 1.0).all()
        if len(seedings_to_fix) > 0:
            for s_fix in seedings_to_fix:
                s_fix.survival_pct = float(s_fix.survival_pct) * 100.0
            print(f"Cleanup: Corregidos {len(seedings_to_fix)} registros de Seeding con survival_pct decimal.")
            
        cycles_to_fix = db.query(Cycle).filter(Cycle.survival_pct > 0, Cycle.survival_pct <= 1.0).all()
        if len(cycles_to_fix) > 0:
            for c_fix in cycles_to_fix:
                c_fix.survival_pct = float(c_fix.survival_pct) * 100.0
            print(f"Cleanup: Corregidos {len(cycles_to_fix)} registros de Cycle con survival_pct decimal.")
            
        if len(seedings_to_fix) > 0 or len(cycles_to_fix) > 0:
            db.commit()
    except Exception as ex:
        print("Error during active cycles and survival_pct cleanup startup:", ex)
        db.rollback()
        
    db.close()
except Exception as e:
    print(f"Error al ejecutar autocuración de ciclos: {e}")

app = FastAPI(
    title="Sistema de Indicadores Acuícolas 2026",
    description="Backend API to manage, inspect, and aggregate shrimp aquaculture cycles, seedings, and harvests",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api
app.include_router(cycles.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(harvests.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(import_api.router, prefix="/api")
app.include_router(ponds.router, prefix="/api")
app.include_router(seedings.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(audit_api.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bienvenido al Sistema de Indicadores Acuícolas Cofimar 2026 API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
