import os
import sys

# Ensure the root directory of the workspace is in sys.path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.append(base_dir)

from backend.database import SessionLocal, Base, engine
from backend.services.importer import import_excel_file

def main():
    print("Iniciando la creacion de las tablas de la base de datos...")
    Base.metadata.create_all(bind=engine)
    
    # Path to the Excel file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    excel_path = os.path.join(base_dir, "BASE INDICADORES 2026.xlsm")
    
    if not os.path.exists(excel_path):
        print(f"Error: No se encontro el archivo de Excel en: {excel_path}")
        return
        
    print(f"Importando datos desde: {excel_path} ...")
    
    db = SessionLocal()
    try:
        results = import_excel_file(excel_path, db)
        print("Importacion completada con exito!")
        print(f" - Piscinas importadas: {results['imported_ponds']}")
        print(f" - Siembras importadas: {results['imported_seedings']}")
        print(f" - Cosechas importadas: {results['imported_harvests']}")
        print(f" - Ciclos importados: {results['imported_cycles']}")
        
        if results['errors']:
            print("Errores encontrados durante la importacion:")
            for err in results['errors']:
                print(f"  * {err}")
        else:
            print("No se encontraron errores.")
    except Exception as e:
        print(f"Error critico durante la importacion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
