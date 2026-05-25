import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import Pond
from .routers import cycles, summary, harvests, catalog, import_api, ponds, seedings

# Create database tables automatically
Base.metadata.create_all(bind=engine)

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
