import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Pond
from .routers import cycles, summary, harvests, catalog, import_api, ponds, seedings

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
    from .models import Cycle
    open_historical = db.query(Cycle).filter(Cycle.is_closed == None).all()
    if len(open_historical) > 0:
        for c in open_historical:
            c.is_closed = True
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Bienvenido al Sistema de Indicadores Acuícolas Cofimar 2026 API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
