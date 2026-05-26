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
    return str(val).strip().upper()

def import_excel_file(file_path: str, db: Session):
    errors = []
    
    # Read worksheets
    # 1. DATOS (Ponds)
    ponds_imported = 0
    try:
        df_datos = pd.read_excel(file_path, sheet_name="DATOS")
        df_datos.columns = [str(c).upper().strip() for c in df_datos.columns]
        
        # Filter rows that have 'SECTOR/PISC'
        df_datos = df_datos.dropna(subset=['SECTOR/PISC'])
        
        # Clear existing ponds
        db.query(Pond).delete()
        
        added_codes = set()
        for _, row in df_datos.iterrows():
            code = clean_str(row.get('SECTOR/PISC'))
            if not code or code in added_codes:
                continue
            
            added_codes.add(code)
            
            # Resolve sector from prefix
            prefix = code.split()[0] if len(code.split()) > 0 else ''
            sector = PREFIX_TO_SECTOR.get(prefix.upper(), prefix.upper())
            
            sector_chiefs_map = {
                'DORADO': 'DAVID SANCHEZ',
                'TUNA': 'GUSTAVO CARRASCO',
                'COCORA': 'JEFE COCORA',
                'MARIA': 'JEFE MARIA',
                'CHUPADORES': 'JEFE CHUPADORES',
                'SOLEDAD': 'JEFE SOLEDAD'
            }
            sector_chief = sector_chiefs_map.get((sector or '').upper())
            
            pond = Pond(
                code=code,
                hectares=clean_num(row.get('HAS')),
                certification=clean_str(row.get('CERTIFICADA')),
                sector=sector,
                sector_chief=sector_chief
            )
            db.add(pond)
            ponds_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing DATOS (ponds): {str(e)}")
 
    # 2. COSECHAS (Harvests)
    harvests_imported = 0
    try:
        df_cosechas = pd.read_excel(file_path, sheet_name="COSECHAS")
        df_cosechas.columns = [str(c).upper().strip() for c in df_cosechas.columns]
        
        # Clear existing harvests
        db.query(Harvest).delete()
        
        for _, row in df_cosechas.iterrows():
            pond_code = clean_str(row.get('SECTOR/PISCINA'))
            activity = clean_str(row.get('ACTIVIDAD'))
            
            # Skip invalid, empty, or summary rows
            if not pond_code or not activity or activity.upper() not in ['PESCA', 'RALEO']:
                continue
                
            harvest = Harvest(
                pond_code=pond_code,
                activity=activity.upper(),
                harvest_date=parse_date(row.get('COSECHA')),
                sector=clean_str(row.get('SECTOR')),
                pond_name=clean_str(row.get('PISCINA')),
                sector_chief=clean_str(row.get('JEFE DE SECTOR')),
                animals=clean_num(row.get('ANIMALES')),
                lbs_farm=clean_num(row.get('LIBRAS')),
                gr_farm=clean_num(row.get('W')),
                lbs_plant=clean_num(row.get('LIBRAS PLANTA')),
                gr_plant=clean_num(row.get('W PLANTA')),
                month=clean_str(row.get('MES')),
                certification=clean_str(row.get('CERTIFICADO'))
            )
            db.add(harvest)
            harvests_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing COSECHAS (harvests): {str(e)}")
 
    # 3. SIEMBRAS (Seedings)
    seedings_imported = 0
    try:
        df_siembras = pd.read_excel(file_path, sheet_name="SIEMBRAS")
        df_siembras.columns = [str(c).upper().strip() for c in df_siembras.columns]
        
        # Clear existing seedings
        db.query(Seeding).delete()
        
        for _, row in df_siembras.iterrows():
            pond_code = clean_str(row.get('PISCINA'))
            if not pond_code:
                continue
                
            seeding = Seeding(
                pond_code=pond_code,
                aguaje=clean_str(row.get('AGUAJE')),
                seeding_date=parse_date(row.get('SIEMBRA')),
                transfer_date=parse_date(row.get('TRANSFERENCIA')),
                animals=clean_int(row.get('LARVA')),
                ablation=clean_str(row.get('ABLACION')),
                nauplio=clean_str(row.get('NAUPLIO')),
                laboratory=clean_str(row.get('LABORATORIO')),
                survival_pct=float(clean_num(row.get('SOBREVIVENCIA')) or 0) * 100.0 if clean_num(row.get('SOBREVIVENCIA')) is not None and float(clean_num(row.get('SOBREVIVENCIA')) or 0) <= 1.0 else clean_num(row.get('SOBREVIVENCIA')),
                pre_criadero=clean_str(row.get('PRECRIADERO')),
                weight_gr=clean_num(row.get('W'))
            )
            db.add(seeding)
            seedings_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing SIEMBRAS (seedings): {str(e)}")
 
    # 4. BASE 2026 (Closed Cycles)
    cycles_imported = 0
    try:
        df_base = pd.read_excel(file_path, sheet_name="BASE 2026", skiprows=1)
        df_base.columns = [str(c).upper().strip() for c in df_base.columns]
        
        # Filter rows with FECHA and CODIGO
        df_base = df_base.dropna(subset=['FECHA', 'CODIGO'])
        
        # Clear existing cycles
        db.query(Cycle).delete()
        
        for _, row in df_base.iterrows():
            harvest_date = parse_date(row.get('FECHA'))
            pond_code = clean_str(row.get('CODIGO'))
            
            if not harvest_date or not pond_code:
                continue
                
            seeding_date = parse_date(row.get('FECHA DE SIEMBRA'))
            harvests_in_cycle = []
            if seeding_date:
                harvests_in_cycle = db.query(Harvest).filter(
                    Harvest.pond_code == pond_code,
                    Harvest.harvest_date >= seeding_date,
                    Harvest.harvest_date <= harvest_date
                ).all()
 
            # Special case override for DO 10 on 2026-05-21 as requested by the user
            if pond_code == "DO 10" and harvest_date == parse_date("2026-05-21"):
                harvests_in_cycle = [h for h in harvests_in_cycle if h.harvest_date != parse_date("2026-04-17")]
 
            if len(harvests_in_cycle) > 0:
                lbs_trawl_farm = 0.0
                lbs_trawl_plant = 0.0
                lbs_harvest_farm = 0.0
                lbs_harvest_plant = 0.0
                
                gr_trawl_farm_sum = 0.0
                gr_trawl_plant_sum = 0.0
                gr_trawl_count = 0
                
                gr_harvest_farm_sum = 0.0
                gr_harvest_plant_sum = 0.0
                gr_harvest_count = 0
                
                animals_trawl = 0.0
                animals_harvest = 0.0
                
                for h in harvests_in_cycle:
                    h_lbs_farm = float(h.lbs_farm or 0)
                    h_lbs_plant = float(h.lbs_plant or 0)
                    h_gr_farm = float(h.gr_farm or 0)
                    h_gr_plant = float(h.gr_plant or 0)
                    h_animals = float(h.animals or 0)
                    
                    if h.activity == "RALEO":
                        lbs_trawl_farm += h_lbs_farm
                        lbs_trawl_plant += h_lbs_plant
                        if h_gr_farm > 0:
                            gr_trawl_farm_sum += h_gr_farm
                        if h_gr_plant > 0:
                            gr_trawl_plant_sum += h_gr_plant
                            gr_trawl_count += 1
                        animals_trawl += h_animals
                    elif h.activity == "PESCA":
                        lbs_harvest_farm += h_lbs_farm
                        lbs_harvest_plant += h_lbs_plant
                        if h_gr_farm > 0:
                            gr_harvest_farm_sum += h_gr_farm
                        if h_gr_plant > 0:
                            gr_harvest_plant_sum += h_gr_plant
                            gr_harvest_count += 1
                        animals_harvest += h_animals
                
                gr_trawl_farm = gr_trawl_farm_sum / gr_trawl_count if gr_trawl_count > 0 else clean_num(row.get('GRAMAJE RALEO CAMARONERA'))
                gr_trawl_plant = gr_trawl_plant_sum / gr_trawl_count if gr_trawl_count > 0 else clean_num(row.get('GRAMAJE RALEO PLANTA'))
                
                gr_harvest_farm = gr_harvest_farm_sum / gr_harvest_count if gr_harvest_count > 0 else clean_num(row.get('GRAMAJE CAMARONERA'))
                gr_harvest_plant = gr_harvest_plant_sum / gr_harvest_count if gr_harvest_count > 0 else clean_num(row.get('GRAMOS PLANTA'))
            else:
                lbs_trawl_farm = clean_num(row.get('LIBRAS RALEO CAMARONERA'))
                lbs_trawl_plant = clean_num(row.get('LIBRAS RALEO PLANTA'))
                gr_trawl_farm = clean_num(row.get('GRAMAJE RALEO CAMARONERA'))
                gr_trawl_plant = clean_num(row.get('GRAMAJE RALEO PLANTA'))
                animals_trawl = clean_num(row.get('CAM COSECHADOS RALEO'))
                
                lbs_harvest_farm = clean_num(row.get('LIBRAS CAMARONERA'))
                lbs_harvest_plant = clean_num(row.get('LIBRAS PLANTA'))
                gr_harvest_farm = clean_num(row.get('GRAMAJE CAMARONERA'))
                gr_harvest_plant = clean_num(row.get('GRAMOS PLANTA'))
                animals_harvest = clean_num(row.get('CAM COSECHADOS'))
 
            cycle = Cycle(
                id=clean_int(row.get('ID')),
                harvest_date=harvest_date,
                year=clean_int(row.get('AÑO')),
                aguaje=clean_str(row.get('AGUAJE')),
                month=clean_str(row.get('MES')),
                pond_code=pond_code,
                pond_name=clean_str(row.get('PISCINA')),
                sector=clean_str(row.get('SECTOR')),
                hectares=clean_num(row.get('HAS')),
                certification=clean_str(row.get('CERTIFICACIÓN')),
                days=clean_int(row.get('DIAS')),
                seeding_date=seeding_date,
                pre=clean_str(row.get('PRE')),
                seeding_weight=clean_num(row.get('PESO DE SIEMBRA')),
                dry_days=clean_int(row.get('DIAS SECOS')),
                animals_seeded=clean_int(row.get('ANIM SEMBRADOS')),
                
                # Raleos
                lbs_trawl_farm=lbs_trawl_farm,
                lbs_trawl_plant=lbs_trawl_plant,
                gr_trawl_farm=gr_trawl_farm,
                gr_trawl_plant=gr_trawl_plant,
                lbs_ha_trawl=lbs_trawl_plant / clean_num(row.get('HAS')) if clean_num(row.get('HAS')) > 0 else 0.0,
                animals_trawl=animals_trawl,
                
                # Liquidación
                lbs_harvest_farm=lbs_harvest_farm,
                lbs_harvest_plant=lbs_harvest_plant,
                gr_harvest_farm=gr_harvest_farm,
                gr_harvest_plant=gr_harvest_plant,
                lbs_ha_harvest=lbs_harvest_plant / clean_num(row.get('HAS')) if clean_num(row.get('HAS')) > 0 else 0.0,
                animals_harvest=animals_harvest,
                
                # Feed
                feed_lbs=clean_num(row.get('BALANCEADO ACUMULADO (LBS)')),
                feed_supplier=clean_str(row.get('PROVEEDOR BALANCEADO')),
                feeding_mode=clean_str(row.get('MODO ALIMENTACION')),
                
                # Responsable
                sector_chief=clean_str(row.get('JEFE DE SECTOR')),
                is_closed=True
            )
            
            # Recalculate KPIs using our python services
            calc_kpis(cycle)
            
            db.add(cycle)
            cycles_imported += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error parsing BASE 2026 (cycles): {str(e)}")

    # 5. GENERATE ACTIVE OR UNMAPED CLOSED CYCLES FROM SEEDINGS
    try:
        all_closed_cycles = db.query(Cycle).all()
        closed_seeding_keys = {(c.pond_code, c.seeding_date) for c in all_closed_cycles if c.seeding_date}
        
        all_seedings = db.query(Seeding).all()
        
        for s in all_seedings:
            key = (s.pond_code, s.seeding_date)
            if key not in closed_seeding_keys and s.seeding_date:
                # Retrieve pond details
                pond = db.query(Pond).filter(Pond.code == s.pond_code).first()
                hectares = pond.hectares if pond else None
                sector = pond.sector if pond else None
                certification = pond.certification if pond else None
                pond_name = s.pond_code.split(" ")[1] if " " in s.pond_code else s.pond_code
                sector_chief = pond.sector_chief if pond else None
                
                # Check harvests registered for this active cycle
                harvests_in_active_cycle = db.query(Harvest).filter(
                    Harvest.pond_code == s.pond_code,
                    Harvest.harvest_date >= s.seeding_date
                ).all()
                
                lbs_trawl_farm = 0.0
                lbs_trawl_plant = 0.0
                gr_trawl_farm_sum = 0.0
                gr_trawl_plant_sum = 0.0
                gr_trawl_count = 0
                animals_trawl = 0.0
                
                lbs_harvest_farm = 0.0
                lbs_harvest_plant = 0.0
                gr_harvest_farm = 0.0
                gr_harvest_plant = 0.0
                animals_harvest = 0.0
                
                feed_lbs = 0.0
                feed_supplier = None
                feeding_mode = "AUTOMATICA"
                
                has_pesca = False
                pesca_harvest = None
                
                for h in harvests_in_active_cycle:
                    h_lbs_farm = float(h.lbs_farm or 0)
                    h_lbs_plant = float(h.lbs_plant or 0)
                    h_gr_farm = float(h.gr_farm or 0)
                    h_gr_plant = float(h.gr_plant or 0)
                    h_animals = float(h.animals or 0)
                    
                    if h.activity == "RALEO":
                        lbs_trawl_farm += h_lbs_farm
                        lbs_trawl_plant += h_lbs_plant
                        if h_gr_farm > 0:
                            gr_trawl_farm_sum += h_gr_farm
                        if h_gr_plant > 0:
                            gr_trawl_plant_sum += h_gr_plant
                            gr_trawl_count += 1
                        animals_trawl += h_animals
                    elif h.activity == "PESCA":
                        has_pesca = True
                        pesca_harvest = h
                        lbs_harvest_farm = h_lbs_farm
                        lbs_harvest_plant = h_lbs_plant
                        gr_harvest_farm = h_gr_farm
                        gr_harvest_plant = h_gr_plant
                        animals_harvest = h_animals
                        feed_lbs = float(h.feed_lbs or 0)
                        feed_supplier = h.feed_supplier
                        feeding_mode = h.feeding_mode or "AUTOMATICA"
                
                gr_trawl_farm = gr_trawl_farm_sum / gr_trawl_count if gr_trawl_count > 0 else 0.0
                gr_trawl_plant = gr_trawl_plant_sum / gr_trawl_count if gr_trawl_count > 0 else 0.0
                
                is_closed = has_pesca
                
                active_cycle = Cycle(
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
                    
                    lbs_trawl_farm=lbs_trawl_farm,
                    lbs_trawl_plant=lbs_trawl_plant,
                    gr_trawl_farm=gr_trawl_farm,
                    gr_trawl_plant=gr_trawl_plant,
                    lbs_ha_trawl=lbs_trawl_plant / float(hectares or 1.0) if hectares else 0.0,
                    animals_trawl=animals_trawl,
                    
                    lbs_harvest_farm=lbs_harvest_farm,
                    lbs_harvest_plant=lbs_harvest_plant,
                    gr_harvest_farm=gr_harvest_farm,
                    gr_harvest_plant=gr_harvest_plant,
                    lbs_ha_harvest=lbs_harvest_plant / float(hectares or 1.0) if hectares else 0.0,
                    animals_harvest=animals_harvest,
                    
                    feed_lbs=feed_lbs,
                    feed_supplier=feed_supplier,
                    feeding_mode=feeding_mode,
                    
                    sector_chief=sector_chief
                )
                
                calc_kpis(active_cycle)
                
                if is_closed and pesca_harvest:
                    active_cycle.harvest_date = pesca_harvest.harvest_date
                    active_cycle.year = pesca_harvest.harvest_date.year
                    active_cycle.month = pesca_harvest.month
                    if s.seeding_date and pesca_harvest.harvest_date:
                        active_cycle.days = (pesca_harvest.harvest_date - s.seeding_date).days
                            
                db.add(active_cycle)
                
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append(f"Error generating active/closed cycles from seedings: {str(e)}")
 
    return {
        "imported_cycles": cycles_imported,
        "imported_harvests": harvests_imported,
        "imported_seedings": seedings_imported,
        "imported_ponds": ponds_imported,
        "errors": errors
    }
