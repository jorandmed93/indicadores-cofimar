from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import cycles, summary, harvests, catalog, import_api, ponds, seedings

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Indicadores Acuícolas 2026",
    description="Backend API to manage, inspect, and aggregate shrimp aquaculture cycles, seedings, and harvests",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
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
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
