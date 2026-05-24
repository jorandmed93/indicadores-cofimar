import pandas as pd
import datetime
from sqlalchemy.orm import Session
from ..models import Pond, Cycle, Harvest, Seeding
from .kpi_calculator import calc_kpis
import math

# Map CODIGO prefix to Sector name
PREFIX_TO_SECTOR = {
    'BA': 'BARRACUDA',
    'CA': 'CATANUDA',
    'CH': 'CHERNA',
    'DE': 'DELFIN',
    'DO': 'DORADO',
    'GT': 'GUATO',
    'MA': 'MANTARRAYA',
    'ME': 'MERO',
    'PA': 'PAMPANO',
    'PR': 'PARGO ROJO',
    'RO': 'ROBALO',
    'TA': 'TAMBULERO',
    'TI': 'TIBURON',
    'TU': 'TUNA',
    'WA': 'WAHOO'
}

def parse_date(val):
    if pd.isna(val) or val is None:
        return None
    if isinstance(val, datetime.datetime):
        return val.date()
    if isinstance(val, datetime.date):
        return val
    if isinstance(val, pd.Timestamp):
        return val.to_pydatetime().date()
    if isinstance(val, (int, float)):
        # Excel date serial
        try:
            return (datetime.datetime(1899, 12, 30) + datetime.timedelta(days=int(val))).date()
        except Exception:
            return None
    if isinstance(val, str):
        try:
            return pd.to_datetime(val).date()
        except Exception:
            return None
    return None

def clean_num(val):
    if pd.isna(val) or val is None:
        return 0
    if isinstance(val, (int, float)):
        if math.isnan(val) or math.isinf(val):
            return 0
        return val
    try:
        # Strip string and convert
        cleaned = str(val).replace('%', '').replace(',', '').strip()
        return float(cleaned)
    except Exception:
        return 0

def clean_int(val):
    return int(clean_num(val))

def clean_str(val):
    if pd.isna(val) or val is None:
        return None
    return str(val).strip()

def import_excel_file(file_path: str, db: Session):
    errors = []
    
    # Read worksheets
    # 1. DATOS
    ponds_imported = 0
    try:
        df_datos = pd.read_excel(file_path, sheet_name="DATOS")
        # Expected columns: ['sector/pisc', 'has', 'CERTIFICADA']
        # Filter rows that have 'sector/pisc'
        df_datos = df_datos.dropna(subset=['sector/pisc'])
        
        # Clear existing ponds
        db.query(Pond).delete()
        
        added_codes = set()
        for _, row in df_datos.iterrows():
            code = clean_str(row.get('sector/pisc'))
            if not code or code in added_codes:
                continue
            
            added_codes.add(code)
            
            # Resolve sector from prefix
            prefix = code.split()[0] if len(code.split()) > 0 else ''
            sector = PREFIX_TO_SECTOR.get(prefix.upper(), prefix.upper())
            
            pond = Pond(
                code=code,
                hectares=clean_num(row.get('has')),
                certification=clean_str(row.get('CERTIFICADA')),
                sector=sector
            )
            db.add(pond)
            ponds_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing DATOS (ponds): {str(e)}")

    # 2. COSECHAS
    harvests_imported = 0
    try:
        df_cosechas = pd.read_excel(file_path, sheet_name="COSECHAS")
        # Clear existing harvests
        db.query(Harvest).delete()
        
        for _, row in df_cosechas.iterrows():
            pond_code = clean_str(row.get('SECTOR/PISCINA'))
            activity = clean_str(row.get('ACTIVIDAD'))
            
            # Skip invalid, empty, or summary rows at the bottom of the Excel sheet
            if not pond_code or not activity or activity.upper() not in ['PESCA', 'RALEO']:
                continue
                
            harvest = Harvest(
                pond_code=pond_code,
                activity=clean_str(row.get('ACTIVIDAD')),
                harvest_date=parse_date(row.get('COSECHA')),
                sector=clean_str(row.get('SECTOR')),
                pond_name=clean_str(row.get('PISCINA')),
                sector_chief=clean_str(row.get('JEFE DE SECTOR')),
                animals=clean_num(row.get('ANIMALES')),
                lbs_farm=clean_num(row.get('libras')),
                gr_farm=clean_num(row.get('w')),
                lbs_plant=clean_num(row.get('libras planta')),
                gr_plant=clean_num(row.get('W planta')),
                month=clean_str(row.get('MES')),
                certification=clean_str(row.get('CERTIFICADO'))
            )
            db.add(harvest)
            harvests_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing COSECHAS (harvests): {str(e)}")

    # 3. SIEMBRAS
    seedings_imported = 0
    try:
        df_siembras = pd.read_excel(file_path, sheet_name="SIEMBRAS")
        # Clear existing seedings
        db.query(Seeding).delete()
        
        for _, row in df_siembras.iterrows():
            pond_code = clean_str(row.get('PISCINA'))
            if not pond_code:
                continue
                
            seeding = Seeding(
                pond_code=pond_code,
                aguaje=clean_str(row.get('AGUAJE')),
                seeding_date=parse_date(row.get('siembra')),
                transfer_date=parse_date(row.get('transferencia')),
                animals=clean_int(row.get('LARVA')),
                ablation=clean_str(row.get('ABLACION')),
                nauplio=clean_str(row.get('NAUPLIo')),
                laboratory=clean_str(row.get('LABORATORIO')),
                survival_pct=clean_num(row.get('sobrevivencia')),
                pre_criadero=clean_str(row.get('PRECRIADERO')),
                weight_gr=clean_num(row.get('w'))
            )
            db.add(seeding)
            seedings_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing SIEMBRAS (seedings): {str(e)}")

    # 4. BASE 2026
    cycles_imported = 0
    try:
        # BASE 2026 sheet has header sections in row 0, names in row 1.
        # Skip row 0 (skiprows=1 loads the names row 1 as headers)
        df_base = pd.read_excel(file_path, sheet_name="BASE 2026", skiprows=1)
        
        # Filter rows with FECHA and CODIGO
        df_base = df_base.dropna(subset=['FECHA', 'CODIGO'])
        
        # Clear existing cycles
        db.query(Cycle).delete()
        
        for _, row in df_base.iterrows():
            harvest_date = parse_date(row.get('FECHA'))
            pond_code = clean_str(row.get('CODIGO'))
            
            if not harvest_date or not pond_code:
                continue
                
            # Safely extract evaluated grammage values from Excel
            gr_harvest_farm = clean_num(row.get('GRAMAJE CAMARONERA'))
            gr_harvest_plant = clean_num(row.get('GRAMOS PLANTA'))
            
            # Excel SUMIFS Formula Bug Correction:
            # If a pond has both a RALEO and a PESCA on the same day, the Excel formula
            # '=SUMIFS(COSECHAS!F:F, ...)' will sum the grammages (e.g. 36 + 36 = 72).
            # We query the database's `harvests` table for a PESCA event on that day
            # to retrieve the true individual event weight.
            pesca_event = db.query(Harvest).filter(
                Harvest.pond_code == pond_code,
                Harvest.harvest_date == harvest_date,
                Harvest.activity == "PESCA"
            ).first()
            
            if pesca_event:
                if pesca_event.gr_farm > 0 and pesca_event.gr_farm != gr_harvest_farm:
                    gr_harvest_farm = pesca_event.gr_farm
                if pesca_event.gr_plant > 0 and pesca_event.gr_plant != gr_harvest_plant:
                    gr_harvest_plant = pesca_event.gr_plant
            
            cycle = Cycle(
                id=clean_int(row.get('ID')),
                harvest_date=harvest_date,
                year=clean_int(row.get('AÑO')),
                aguaje=clean_str(row.get('AGUAJE ')), # Check with trailing space
                month=clean_str(row.get('MES')),
                pond_code=pond_code,
                pond_name=clean_str(row.get('PISCINA')),
                sector=clean_str(row.get('SECTOR')),
                hectares=clean_num(row.get('HAS')),
                certification=clean_str(row.get('Certificación')),
                days=clean_int(row.get('DIAS')),
                seeding_date=parse_date(row.get('FECHA DE SIEMBRA')),
                pre=clean_str(row.get('PRE')),
                seeding_weight=clean_num(row.get('PESO DE SIEMBRA')),
                dry_days=clean_int(row.get('DIAS SECOS')),
                animals_seeded=clean_int(row.get('ANIM SEMBRADOS')),
                
                # Raleos
                lbs_trawl_farm=clean_num(row.get('LIBRAS RALEO CAMARONERA')),
                lbs_trawl_plant=clean_num(row.get('LIBRAS RALEO PLANTA')),
                gr_trawl_farm=clean_num(row.get('GRAMAJE RALEO CAMARONERA')),
                gr_trawl_plant=clean_num(row.get('GRAMAJE RALEO PLANTA')),
                lbs_ha_trawl=clean_num(row.get('LBS/HA RALEO')),
                animals_trawl=clean_num(row.get('CAM COSECHADOS RALEO')),
                
                # Liquidación
                lbs_harvest_farm=clean_num(row.get('LIBRAS CAMARONERA')),
                lbs_harvest_plant=clean_num(row.get('LIBRAS PLANTA')),
                gr_harvest_farm=gr_harvest_farm,
                gr_harvest_plant=gr_harvest_plant,
                lbs_ha_harvest=clean_num(row.get('LBS/HA COSECHA')),
                animals_harvest=clean_num(row.get('CAM COSECHADOS')),
                
                # Feed
                feed_lbs=clean_num(row.get('BALANCEADO ACUMULADO (LBS)')),
                feed_supplier=clean_str(row.get('PROVEEDOR BALANCEADO')),
                feeding_mode=clean_str(row.get('MODO ALIMENTACION')),
                
                # Responsable
                sector_chief=clean_str(row.get('JEFE DE SECTOR'))
            )
            
            # Recalculate KPIs using our python services to make sure they match!
            calc_kpis(cycle)
            
            db.add(cycle)
            cycles_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing BASE 2026 (cycles): {str(e)}")

    return {
        "imported_cycles": cycles_imported,
        "imported_harvests": harvests_imported,
        "imported_seedings": seedings_imported,
        "imported_ponds": ponds_imported,
        "errors": errors
    }
