# PROMPT COMPLETO — App Web: Sistema de Indicadores Acuícolas 2026

---

## CONTEXTO DEL PROYECTO

Desarrolla una **aplicación web full-stack** para gestionar, consultar y analizar datos de producción acuícola de una empresa camaronera. El sistema reemplaza un libro Excel `.xlsm` llamado `BASE_INDICADORES_2026` y expone toda su lógica como una plataforma consultable en tiempo real.

---

## ANÁLISIS DEL ARCHIVO ORIGINAL (BASE_INDICADORES_2026.xlsm)

### Hojas del libro y su propósito

| Hoja | Propósito |
|------|-----------|
| `BASE 2026` | Tabla principal (TablaPrincipal). Cada fila = 1 ciclo de producción por piscina por aguaje. |
| `COSECHAS` | Tabla de eventos de cosecha/raleo (TablaCosechas). Fuente de libras y gramajes reales. |
| `SIEMBRAS` (Tabla4) | Tabla de siembras: fecha, laboratorio, nauplio, densidad, peso siembra. |
| `TENTATIVOS` | Piscinas planificadas / cosechas tentativas. |
| `DATOS` | Catálogos: hectáreas por piscina, sectores, códigos de laboratorio, rangos de aguaje. |
| `RESUMEN` | Tabla pivot con promedios por SECTOR de: LBS/HA, FCA, SOBREVIVENCIA, DIAS. |
| `Hoja2` | Tabla pivot de piscinas CHERNA (CH) con promedios por código: DENSIDAD, DIAS, SOBREVIVENCIA, GRAMOS PLANTA. |

---

### Columnas de `BASE 2026` (TablaPrincipal) — 50 campos

#### Identificadores y fechas
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `FECHA` | Date | Fecha de cosecha (serial Excel → date real) |
| `ID` | Int | Número secuencial de registro |
| `AÑO` | Int | `YEAR(FECHA)` |
| `AGUAJE` | String | Período de marea: AGUAJE 1 … AGUAJE N |
| `MES` | String | `UPPER(TEXT(FECHA,"MMMM"))` — mes en español en mayúsculas |
| `CODIGO` | String | Código único de piscina ej: `TI 19`, `CH 01`, `DO 06` |

#### Datos de la piscina
| Campo | Fórmula / Origen | Descripción |
|-------|------------------|-------------|
| `PISCINA` | `VLOOKUP(CODIGO, COSECHAS, 9)` | Nombre/número de piscina |
| `SECTOR` | `VLOOKUP(CODIGO, COSECHAS, 8)` | Sector productivo (TIBURON, CHERNA, DORADO, etc.) |
| `HAS` | `VLOOKUP(CODIGO, DATOS, 2)` | Hectáreas de la piscina |
| `Certificación` | `VLOOKUP(CODIGO, Tabla8, 3)` | Tipo: CONVENCIONAL, ASC-BAP, ASC, BAP |
| `DIAS` | `FECHA - FECHA DE SIEMBRA` | Días del ciclo productivo |
| `FECHA DE SIEMBRA` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 4)` | Fecha en que se sembró |
| `PRE` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 15)` | Pre-criadero asociado |
| `PESO DE SIEMBRA` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 14)` | Peso en gramos al sembrar |
| `DIAS SECOS` | Manual | Días sin agua (perdidos) |
| `ANIM SEMBRADOS` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 5)` | Total de animales sembrados |
| `DENSIDAD` | `ANIM_SEMBRADOS / HAS` | Camarones por hectárea |
| `DENSIDAD M2` | `DENSIDAD / 10000` | Camarones por m² |
| `LABORATORIO` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 8)` | Laboratorio proveedor de larva |
| `NAUPLIO` | `VLOOKUP(CODIGO & AGUAJE, Tabla4, 7)` | Empresa de nauplio |
| `TIPO DE SIEMBRA` | `IF(FIND("/", LABORATORIO), "COMBINADO", "UNICO")` | Siembra única o combinada de laboratorios |

#### Sección Raleos
Los raleos son cosechas parciales antes de la cosecha final (PESCA).

| Campo | Fórmula | Descripción |
|-------|---------|-------------|
| `LIBRAS RALEO CAMARONERA` | `SUMIFS(TablaCosechas[libras], CODIGO, ">siembra", "<cosecha", ACTIVIDAD="RALEO")` | Libras declaradas por la camaronera en raleos |
| `LIBRAS RALEO PLANTA` | `SUMIFS(TablaCosechas[libras planta], ...)` | Libras confirmadas por planta en raleos |
| `GRAMAJE RALEO CAMARONERA` | AVG de `w` en raleos | Peso promedio en gramos (raleo, camaronera) |
| `GRAMAJE RALEO PLANTA` | AVG de `W planta` en raleos | Peso promedio en gramos (raleo, planta) |
| `LBS/HA RALEO` | `LIBRAS_RALEO_PLANTA / HAS` | Libras por hectárea en raleos |
| `CAM COSECHADOS RALEO` | `SUMIFS(TablaCosechas[ANIMALES], ...)` | Animales cosechados en raleos |

#### Sección Liquidación (Cosecha final — PESCA)
| Campo | Fórmula | Descripción |
|-------|---------|-------------|
| `LIBRAS CAMARONERA` | `SUMIFS(TablaCosechas[libras], ..., ACTIVIDAD="PESCA")` | Libras declaradas en cosecha final |
| `LIBRAS PLANTA` | `SUMIFS(TablaCosechas[libras planta], ..., ACTIVIDAD="PESCA")` | Libras confirmadas por planta |
| `GRAMAJE CAMARONERA` | `SUMIFS(COSECHAS!F, COSECHAS!A=CODIGO, COSECHAS!G=FECHA)` | Gramos promedio (camaronera) en cosecha final |
| `GRAMOS PLANTA` | `SUMIFS(COSECHAS!M, ...)` | Gramos promedio (planta) en cosecha final |
| `LBS/HA COSECHA` | `LIBRAS_PLANTA / HAS` | Rendimiento de cosecha final por ha |
| `CAM COSECHADOS` | `LIBRAS_PLANTA * 454 / GRAMOS_PLANTA` | Animales estimados en cosecha final |

#### Resultados Consolidados
| Campo | Fórmula | Descripción |
|-------|---------|-------------|
| `LIBRAS TOTALES` | `LIBRAS_RALEO_PLANTA + LIBRAS_PLANTA` | Total libras del ciclo |
| `CAM COSECHADOS TOTALES` | `CAM_RALEO + CAM_COSECHADOS` | Total animales cosechados |
| `LBS/HA` | `LIBRAS_TOTALES / HAS` | **KPI principal**: rendimiento total por hectárea |
| `INCREM` | `GRAMOS_PLANTA / (DIAS/7)` | Incremento semanal en gramos |
| `LBS/HA/DIA` | `LBS_HA / DIAS` | Productividad diaria |
| `SOBREVIVENCIA` | `CAM_TOTALES / ANIM_SEMBRADOS * 100` | % de supervivencia |
| `BALANCEADO ACUMULADO (LBS)` | Manual | Total de alimento consumido |
| `KG/HA` | `(BALANCEADO_LBS / 2.2046) / HAS / DIAS` | Kg de balanceado por ha por día |
| `FCA` | `BALANCEADO_LBS / LIBRAS_TOTALES` | **Factor de Conversión Alimenticia** (< 1.5 es bueno) |
| `PROVEEDOR BALANCEADO` | Manual | Empresa de alimento: SK, NC, CG, etc. |
| `MODO ALIMENTACION` | Manual | AUTOMATICA o BOLEO |

#### Diferencias (Control de calidad)
| Campo | Fórmula | Descripción |
|-------|---------|-------------|
| `DIF RALEO` | `LIBRAS_RALEO_PLANTA - LIBRAS_RALEO_CAMARONERA` | Diferencia en raleos (control) |
| `DIF LIQUID` | `LIBRAS_PLANTA - LIBRAS_CAMARONERA` | Diferencia en liquidación |
| `DIF RALEO GR` | `GRAMAJE_RALEO_PLANTA - GRAMAJE_RALEO_CAMARONERA` | Diferencia en gramaje raleo |
| `DIF LIQUID GR` | `GRAMOS_PLANTA - GRAMAJE_CAMARONERA` | Diferencia en gramaje liquidación |
| `JEFE DE SECTOR` | `VLOOKUP(CODIGO, TablaCosechas, 10)` | Responsable del sector |
| `JEFE SECTOR` | `VLOOKUP(CODIGO, TablaCosechas, 10)` | Ídem (columna duplicada) |

---

### Sectores productivos (valores de `SECTOR`)
```
BARRRACUDA, CATANUDA, CHERNA, DELFIN, DORADO, GUATO, MANTARRAYA,
MERO, PAMPANO, PARGO ROJO, ROBALO, TAMBULERO, TIBURON, TUNA, WAHOO
```

### Tipos de Certificación
```
CONVENCIONAL, ASC-BAP, ASC, BAP
```

---

## REQUISITOS DEL SISTEMA A CONSTRUIR

### Stack Tecnológico

**Backend:**
- **Python + FastAPI** (o Node.js + Express)
- Base de datos: **PostgreSQL** con tablas relacionales
- ORM: **SQLAlchemy** (o Prisma si Node)
- Importación de datos: endpoint que acepta el `.xlsm` y procesa todo con `openpyxl` + `pandas`
- Endpoints REST + filtros dinámicos

**Frontend:**
- **React + TypeScript**
- UI: **Tailwind CSS** + componentes propios o ShadCN
- Gráficos: **Recharts** o **ApexCharts**
- Tablas interactivas con filtros, búsqueda y paginación
- Exportación a Excel/CSV

**Infraestructura:**
- Docker Compose (backend + frontend + postgres)
- `.env` para configuración

---

## MODELO DE DATOS (PostgreSQL)

### Tabla `cycles` (ciclos productivos — ex BASE 2026)
```sql
CREATE TABLE cycles (
  id              SERIAL PRIMARY KEY,
  harvest_date    DATE NOT NULL,
  year            INT,
  aguaje          VARCHAR(20),
  month           VARCHAR(20),
  pond_code       VARCHAR(20) NOT NULL,     -- CODIGO
  pond_name       VARCHAR(50),              -- PISCINA
  sector          VARCHAR(50),
  hectares        NUMERIC(8,2),
  certification   VARCHAR(30),
  days            INT,
  seeding_date    DATE,
  pre             VARCHAR(30),
  seeding_weight  NUMERIC(8,3),
  dry_days        INT,
  animals_seeded  INT,
  density_ha      NUMERIC(12,2),
  density_m2      NUMERIC(8,4),
  laboratory      VARCHAR(100),
  nauplio         VARCHAR(100),
  seeding_type    VARCHAR(20),              -- UNICO / COMBINADO

  -- Raleos
  lbs_trawl_farm  NUMERIC(12,2),
  lbs_trawl_plant NUMERIC(12,2),
  gr_trawl_farm   NUMERIC(8,3),
  gr_trawl_plant  NUMERIC(8,3),
  lbs_ha_trawl    NUMERIC(12,4),
  animals_trawl   NUMERIC(14,2),

  -- Liquidación
  lbs_harvest_farm  NUMERIC(12,2),
  lbs_harvest_plant NUMERIC(12,2),
  gr_harvest_farm   NUMERIC(8,3),
  gr_harvest_plant  NUMERIC(8,3),
  lbs_ha_harvest    NUMERIC(12,4),
  animals_harvest   NUMERIC(14,2),

  -- Resultados
  total_lbs           NUMERIC(14,2),
  total_animals       NUMERIC(14,2),
  lbs_ha              NUMERIC(12,4),        -- KPI principal
  weekly_increment    NUMERIC(8,4),
  lbs_ha_day          NUMERIC(12,6),
  survival_pct        NUMERIC(8,4),
  feed_lbs            NUMERIC(14,2),
  kg_ha               NUMERIC(12,4),
  fca                 NUMERIC(8,4),         -- KPI principal
  feed_supplier       VARCHAR(30),
  feeding_mode        VARCHAR(20),

  -- Diferencias (QC)
  diff_trawl_lbs    NUMERIC(12,2),
  diff_harvest_lbs  NUMERIC(12,2),
  diff_trawl_gr     NUMERIC(8,3),
  diff_harvest_gr   NUMERIC(8,3),

  -- Responsable
  sector_chief      VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabla `harvests` (cosechas/raleos — ex COSECHAS)
```sql
CREATE TABLE harvests (
  id          SERIAL PRIMARY KEY,
  pond_code   VARCHAR(20),
  activity    VARCHAR(20),  -- PESCA / RALEO
  harvest_date DATE,
  sector      VARCHAR(50),
  pond_name   VARCHAR(50),
  sector_chief VARCHAR(100),
  animals     NUMERIC(14,2),
  lbs_farm    NUMERIC(12,2),
  gr_farm     NUMERIC(8,3),
  lbs_plant   NUMERIC(12,2),
  gr_plant    NUMERIC(8,3),
  month       VARCHAR(20),
  certification VARCHAR(30)
);
```

### Tabla `seedings` (siembras — ex SIEMBRAS/Tabla4)
```sql
CREATE TABLE seedings (
  id              SERIAL PRIMARY KEY,
  pond_code       VARCHAR(20),
  aguaje          VARCHAR(20),
  seeding_date    DATE,
  transfer_date   DATE,
  animals         INT,
  ablation        VARCHAR(30),
  nauplio         VARCHAR(100),
  laboratory      VARCHAR(100),
  survival_pct    NUMERIC(8,4),
  pre_criadero    VARCHAR(50),
  weight_gr       NUMERIC(8,3)
);
```

### Tabla `ponds` (catálogo — ex DATOS)
```sql
CREATE TABLE ponds (
  code          VARCHAR(20) PRIMARY KEY,
  sector        VARCHAR(50),
  hectares      NUMERIC(8,2),
  certification VARCHAR(30)
);
```

---

## ENDPOINTS DE LA API

### Importación
```
POST /api/import
  Body: multipart/form-data { file: .xlsm }
  Respuesta: { imported_cycles: N, imported_harvests: M, errors: [...] }
```

### Ciclos (BASE 2026)
```
GET  /api/cycles
  Query params opcionales:
    - year, aguaje, month, sector, pond_code, certification
    - date_from, date_to
    - min_lbs_ha, max_lbs_ha
    - min_fca, max_fca
    - min_survival, max_survival
    - page, limit, sort_by, sort_dir
  Respuesta: { data: [...], total: N, page: P, pages: Q }

GET  /api/cycles/:id           → Detalle completo de un ciclo
GET  /api/cycles/export        → CSV/Excel de los resultados filtrados
```

### Resumen / Indicadores (equiv. hoja RESUMEN)
```
GET  /api/summary/by-sector
  → Promedio de LBS/HA, FCA, SOBREVIVENCIA, DIAS por SECTOR
  Query: year, aguaje, month

GET  /api/summary/by-aguaje
  → KPIs agrupados por aguaje

GET  /api/summary/by-pond
  → KPIs agrupados por CODIGO de piscina (equiv. Hoja2)

GET  /api/summary/by-month
  → KPIs agrupados por mes

GET  /api/summary/trends
  → Serie temporal de LBS/HA, FCA, SOBREVIVENCIA por fecha
  Query: sector, pond_code, groupBy (day|week|month|aguaje)
```

### Catálogos
```
GET  /api/sectors        → Lista de sectores únicos
GET  /api/ponds          → Lista de piscinas con hectáreas
GET  /api/aguajes        → Lista de aguajes disponibles
GET  /api/certifications → Tipos de certificación
```

### Cosechas
```
GET  /api/harvests
  Query: pond_code, activity, date_from, date_to, sector
```

---

## FRONTEND — PÁGINAS Y COMPONENTES

### 1. Dashboard Principal (`/`)
- Cards de KPIs globales: LBS/HA promedio, FCA promedio, % Sobrevivencia promedio, Total ciclos
- Gráfico de barras: LBS/HA por Sector (comparativo)
- Gráfico de línea: Evolución de LBS/HA por aguaje en el tiempo
- Top 10 piscinas con mayor rendimiento (LBS/HA)
- Filtros globales: Año | Aguaje | Mes | Sector | Certificación

### 2. Tabla de Ciclos (`/cycles`)
- Tabla paginada con **todas las columnas** de BASE 2026
- Filtros por columna (dropdown para categorías, rango numérico para KPIs)
- Búsqueda por CODIGO o JEFE DE SECTOR
- Click en fila → panel lateral con detalle completo
- Botón "Exportar Excel"
- Color coding de filas:
  - Verde: LBS/HA > 7000
  - Amarillo: LBS/HA 4000–7000
  - Rojo: LBS/HA < 4000

### 3. Resumen por Sector (`/summary`)
- Tabla idéntica a la hoja `RESUMEN` del Excel:
  - Columnas: SECTOR | Promedio LBS/HA | FCA | SOBREVIVENCIA | DIAS
  - Filtros: año, aguaje
- Gráfico radar de KPIs normalizados por sector
- Gráfico de dispersión FCA vs LBS/HA por piscina

### 4. Análisis de Piscina (`/pond/:code`)
- Historial completo de ciclos de esa piscina
- Evolución de: LBS/HA, FCA, SOBREVIVENCIA, GRAMOS PLANTA por aguaje
- Datos de siembra más reciente
- Comparación vs promedio del sector

### 5. Carga de Datos (`/import`)
- Dropzone para subir `.xlsm`
- Barra de progreso de importación
- Reporte de errores/conflictos (ej. IDs duplicados)
- Log de cuántos registros se importaron por hoja

### 6. Cosechas (`/harvests`)
- Tabla de todos los eventos (PESCA y RALEO)
- Filtros: actividad, sector, rango de fechas
- Diferencias QC: highlight cuando DIF_LIQUID_LBS > 500 o DIF_LIQUID_GR > 2

---

## LÓGICA DE NEGOCIO CRÍTICA

### 1. Importación del .xlsm
```python
# Pseudocódigo del parser
wb = openpyxl.load_workbook(file, read_only=False, keep_vba=True)

# 1. DATOS → tabla ponds
parse_ponds(wb["DATOS"])  # cols A:C (código, has, certificación)

# 2. COSECHAS → tabla harvests
parse_harvests(wb["COSECHAS"])  # cada fila = un evento raleo/pesca

# 3. SIEMBRAS (Tabla4) → tabla seedings
parse_seedings(wb["SIEMBRAS"])  # clave = PISCINA + AGUAJE

# 4. BASE 2026 → tabla cycles
# OJO: los valores son calculados, no fórmulas en el .xlsm exportado
# Leer valores directamente (ya calculados por Excel)
parse_cycles(wb["BASE 2026"])
# Mapear columnas A=fecha, B=id, F=piscina, G=sector, H=has...
# Columna AG = LIBRAS TOTALES, AI = LBS/HA, AL = SOBREVIVENCIA, AO = FCA
```

### 2. Cálculo de KPIs (para recalcular si se ingresan datos manuales)
```python
def calc_kpis(cycle):
    cycle.density_ha = cycle.animals_seeded / cycle.hectares
    cycle.density_m2 = cycle.density_ha / 10000
    cycle.seeding_type = "COMBINADO" if "/" in (cycle.laboratory or "") else "UNICO"
    cycle.total_lbs = cycle.lbs_trawl_plant + cycle.lbs_harvest_plant
    cycle.lbs_ha = cycle.total_lbs / cycle.hectares
    cycle.animals_harvest = (cycle.lbs_harvest_plant * 454) / cycle.gr_harvest_plant
    cycle.total_animals = cycle.animals_trawl + cycle.animals_harvest
    cycle.survival_pct = (cycle.total_animals / cycle.animals_seeded) * 100
    cycle.lbs_ha_day = cycle.lbs_ha / cycle.days
    cycle.weekly_increment = cycle.gr_harvest_plant / (cycle.days / 7)
    cycle.kg_ha = ((cycle.feed_lbs / 2.2046) / cycle.hectares) / cycle.days
    cycle.fca = cycle.feed_lbs / cycle.total_lbs
    cycle.diff_trawl_lbs = cycle.lbs_trawl_plant - cycle.lbs_trawl_farm
    cycle.diff_harvest_lbs = cycle.lbs_harvest_plant - cycle.lbs_harvest_farm
    cycle.diff_trawl_gr = cycle.gr_trawl_plant - cycle.gr_trawl_farm
    cycle.diff_harvest_gr = cycle.gr_harvest_plant - cycle.gr_harvest_farm
```

### 3. Regla de Tipo de Siembra
```
Si LABORATORIO contiene "/" → COMBINADO (dos laboratorios)
Si no contiene "/" → UNICO
```

### 4. Filtros de Cosecha para Raleos vs Pesca
```
RALEO: ACTIVIDAD = "RALEO" AND COSECHA > FECHA_SIEMBRA AND COSECHA < FECHA_COSECHA
PESCA: ACTIVIDAD = "PESCA" AND COSECHA > FECHA_SIEMBRA AND COSECHA <= FECHA_COSECHA
```

---

## PALETA DE KPIs — REFERENCIAS DE RENDIMIENTO

Basado en los datos reales del archivo:

| KPI | Bueno | Regular | Malo |
|-----|-------|---------|------|
| LBS/HA | > 7000 | 4000–7000 | < 4000 |
| FCA | < 1.35 | 1.35–1.70 | > 1.70 |
| SOBREVIVENCIA % | > 70% | 50–70% | < 50% |
| DIAS | Depende del sector | — | — |
| GRAMOS PLANTA | > 35g | 25–35g | < 25g |

---

## DISEÑO VISUAL

**Estética:** industrial-acuícola — colores océano profundo, gris pizarra, acentos en verde agua y ámbar.

**Paleta:**
- Background: `#0A1628` (azul marino oscuro)
- Superficie: `#0F2240`
- Primario: `#00C9A7` (verde agua/teal)
- Acento: `#F5A623` (ámbar/naranja)
- Texto: `#E8F0FE`
- Éxito: `#22C55E` | Advertencia: `#F59E0B` | Peligro: `#EF4444`

**Tipografía:**
- Display: `Space Grotesk` o `DM Mono`
- Body: `Inter` o `Nunito`

**Componentes clave:**
- Tablas con sticky header, zebra striping sutil
- KPI cards con sparkline mini-chart
- Filtros en sidebar colapsable
- Loading skeleton mientras carga data

---

## INSTRUCCIONES DE IMPLEMENTACIÓN

1. **Empezar por el backend**: modelo de datos → parser `.xlsm` → endpoints GET básicos
2. **Validación de la importación**: verificar que LBS/HA calculado coincida con el valor en el Excel (tolerancia ±0.01)
3. **Frontend**: primero el Dashboard, luego la Tabla de Ciclos, luego el resto
4. **No hardcodear sectores**: leerlos dinámicamente desde la DB
5. **Paginación server-side**: la tabla puede tener 200+ ciclos, no cargar todo en memoria del cliente
6. **La columna `AGUAJE`** tiene formato `"AGUAJE 1"`, `"AGUAJE 2"`, etc. — tratar como string categórico ordenado
7. **Fechas**: el Excel guarda fechas como seriales numéricos de Windows (días desde 1900-01-01). Convertir correctamente: `datetime(1899, 12, 30) + timedelta(days=valor_serial)`

---

## ENTREGABLES ESPERADOS

```
/
├── backend/
│   ├── main.py               # FastAPI app
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas
│   ├── routers/
│   │   ├── cycles.py
│   │   ├── summary.py
│   │   ├── harvests.py
│   │   └── import.py
│   ├── services/
│   │   ├── importer.py       # Parser .xlsm completo
│   │   └── kpi_calculator.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Cycles.tsx
│   │   │   ├── Summary.tsx
│   │   │   ├── PondDetail.tsx
│   │   │   └── Import.tsx
│   │   ├── components/
│   │   │   ├── KPICard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── SectorChart.tsx
│   │   │   └── Filters.tsx
│   │   └── api/
│   │       └── client.ts     # Axios/fetch wrapper
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

*Prompt generado a partir del análisis completo del archivo `BASE_INDICADORES_2026.xlsm` — incluye 13 hojas, 50 columnas, fórmulas SUMIFS/VLOOKUP, 240+ registros de ciclos productivos de camarón correspondientes a 15 sectores acuícolas.*
