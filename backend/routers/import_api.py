from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import os
import shutil

from ..database import get_db
from ..services.importer import import_excel_file
from ..schemas import ImportResponse

router = APIRouter(prefix="/import", tags=["Import"])

@router.post("", response_model=ImportResponse)
def import_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify file extension
    filename = file.filename or ""
    if not (filename.endswith(".xlsm") or filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a .xlsm or .xlsx file."
        )

    # Save to a temporary file
    temp_dir = "/tmp/cofimar_imports"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, f"temp_{os.getpid()}_{filename}")

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process the Excel file
        result = import_excel_file(temp_file_path, db)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during import processing: {str(e)}"
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/template")
def download_template():
    import io
    import pandas as pd
    from fastapi.responses import StreamingResponse
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        # 1. DATOS
        df_datos = pd.DataFrame([
            {'sector/pisc': 'BA 01', 'has': 10.5, 'CERTIFICADA': 'ASC'}
        ])
        df_datos.to_excel(writer, sheet_name="DATOS", index=False)
        
        # 2. COSECHAS
        df_cosechas = pd.DataFrame([
            {
                'SECTOR/PISCINA': 'BA 01', 'ID': 1, 'COD': 'BA', 'ACTIVIDAD': 'PESCA', 
                'libras': 65000, 'w': 18.5, 'COSECHA': '2026-01-15', 'SECTOR': 'BARRACUDA', 
                'PISCINA': '01', 'JEFE DE SECTOR': 'JEFE Y', 'ANIMALES': 120000, 
                'libras planta': 64200, 'W planta': 18.3, 'MES': 'ENERO', 'CERTIFICADO': 'ASC',
                'DIF LBRS': 800, 'DIF W': 0.2, 'BALANCEADO': 95000
            }
        ])
        df_cosechas.to_excel(writer, sheet_name="COSECHAS", index=False)
        
        # 3. SIEMBRAS
        df_siembras = pd.DataFrame([
            {
                'PISCINA': 'BA 01', 'AGUAJE': 'AGUAJE 1', 'siembra': '2025-11-01', 
                'transferencia': '2025-11-05', 'LARVA': 150000, 'ABLACION': 'NO', 
                'NAUPLIo': 'NAUPLIO A', 'LABORATORIO': 'LAB X', 'sobrevivencia': 75.5, 
                'PRECRIADERO': 'PRECRIADERO Z', 'w': 0.05
            }
        ])
        df_siembras.to_excel(writer, sheet_name="SIEMBRAS", index=False)
        
        # 4. BASE 2026
        df_base = pd.DataFrame([
            {
                'ID': 1, 'FECHA': '2026-01-15', 'AÑO': 2026, 'AGUAJE ': 'AGUAJE 1', 'MES': 'ENERO', 
                'CODIGO': 'BA 01', 'PISCINA': '01', 'SECTOR': 'BARRACUDA', 'HAS': 10.5, 'Certificación': 'ASC', 
                'DIAS': 75, 'FECHA DE SIEMBRA': '2025-11-01', 'PRE': 'CRIADERO A', 'PESO DE SIEMBRA': 0.05, 
                'DIAS SECOS': 10, 'ANIM SEMBRADOS': 150000, 'LIBRAS RALEO CAMARONERA': 500, 'LIBRAS RALEO PLANTA': 480, 
                'GRAMAJE RALEO CAMARONERA': 5.5, 'GRAMAJE RALEO PLANTA': 5.4, 'LBS/HA RALEO': 45, 'CAM COSECHADOS RALEO': 10000, 
                'LIBRAS CAMARONERA': 65000, 'LIBRAS PLANTA': 64200, 'GRAMAGE CAMARONERA': 18.5, 'GRAMOS PLANTA': 18.3, 
                'LBS/HA COSECHA': 6114, 'CAM COSECHADOS': 120000, 'BALANCEADO ACUMULADO (LBS)': 95000, 
                'PROVEEDOR BALANCEADO': 'PROVEEDOR X', 'MODO ALIMENTACION': 'AUTOMATICO', 'JEFE DE SECTOR': 'JEFE Y'
            }
        ])
        df_base.to_excel(writer, sheet_name="BASE 2026", startrow=1, index=False)
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_indicadores_2026.xlsx"}
    )
