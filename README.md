# Sistema de Control & Indicadores Acuícolas Cofimar 2026

Este proyecto es una plataforma web full-stack premium que migra y automatiza la gestión de indicadores de producción acuícola de Cofimar a partir de libros complejos en Excel (`BASE INDICADORES 2026.xlsm`). Desarrollada bajo una arquitectura moderna con **FastAPI** en el backend y **React (TypeScript) + Tailwind CSS** en el frontend, la aplicación automatiza cálculos de biomasa, conversiones alimenticias, sobrevivencia y control de calidad basándose en eventos de báscula.

---

## 🚀 Características Principales

*   **Importador Relacional de Excel:** Procesa de forma transaccional piscinas (`DATOS`), eventos de báscula (`COSECHAS`), siembras (`SIEMBRAS`) y el histórico de ciclos (`BASE 2026`).
*   **Recálculo de KPIs en Tiempo Real:** Automatiza la lógica de negocio y QC para evitar errores manuales.
*   **Dashboard de Alto Rendimiento:** Visualizaciones dinámicas de libras por hectárea, conversiones alimenticias (FCA), y sobrevivencia mediante gráficos premium en Recharts.
*   **Pivot Reports Dinámicos:** Reportes agrupados por Sector, Aguaje de Marea y Meses (equivalentes a las tablas dinámicas del Excel original).
*   **Control de Mermas y Calidad (QC):** Detección automática de desviaciones de gramaje y libras entre camaronera y planta.
*   **Historial por Piscina:** Análisis de la evolución histórica de piscinas individuales a lo largo de varios ciclos cronológicos.

---

## 🛠️ Arquitectura y Tecnologías

### Backend (FastAPI)
*   **Motor API:** FastAPI + Uvicorn.
*   **Base de Datos:** SQLAlchemy ORM con soporte dual:
    *   *Desarrollo:* Base de datos local SQLite (`indicadores.db`) creada automáticamente al iniciar.
    *   *Producción:* PostgreSQL (configurable mediante variable de entorno `DATABASE_URL`).
*   **Validación de Datos:** Pydantic Schemas.
*   **Procesamiento:** Pandas + Openpyxl para procesamiento rápido de hojas de cálculo de gran tamaño.

### Frontend (React + TypeScript)
*   **Empaquetador:** Vite.
*   **Estilos:** Tailwind CSS v3 con una paleta industrial oscura y efectos de glassmorphic.
*   **Componentes e Iconos:** Lucide React.
*   **Gráficos:** Recharts.

---

## ⚙️ Instrucciones de Ejecución

### Opción A: Ejecución con Docker Compose (Recomendada)
Para levantar todos los servicios en contenedores aislados con una sola línea de comandos:

```bash
docker-compose up --build
```
*   **Frontend URL:** `http://localhost:5173`
*   **Backend URL / Swagger API:** `http://localhost:8000/docs`

---

### Opción B: Ejecución Local Nativa (Para Desarrollo)

#### 1. Iniciar el Backend
Desde la raíz del proyecto, accede a la carpeta `backend`, instala las dependencias e inicia el servidor de desarrollo:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Iniciar el Frontend
En otra pestaña de la terminal, accede a la carpeta `frontend`, instala dependencias e inicia el servidor de desarrollo Vite:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

---

## 📐 Fórmulas Matemáticas y KPIs Recalculados

La aplicación automatiza y asegura la precisión de los siguientes KPIs:

1.  **Tipo de Siembra:** `COMBINADO` si el nombre de laboratorio contiene `/`, de lo contrario `UNICO`.
2.  **Densidad por Hectárea:** $\text{DENSIDAD/HA} = \frac{\text{Animales Sembrados}}{\text{Hectáreas}}$
3.  **Libras Totales:** $\text{Libras Raleo Planta} + \text{Libras Cosecha Planta}$
4.  **Rendimiento Principal (LBS/HA):** $\text{LBS/HA} = \frac{\text{Libras Totales}}{\text{Hectáreas}}$
5.  **Factor de Conversión Alimenticia (FCA):** $\text{FCA} = \frac{\text{Balanced Accumulado (LBS)}}{\text{Libras Totales}}$
6.  **Sobrevivencia Estimada %:** $\text{SOBREVIVENCIA \%} = \left( \frac{\text{Animales Totales Cosechados}}{\text{Animales Sembrados}} \right) \times 100$
7.  **Incremento Semanal (Gramos):** $\text{INCREM} = \frac{\text{Gramaje Final Planta}}{\left( \frac{\text{Días del Ciclo}}{7} \right)}$
8.  **QC Diferencia Libras:** $\text{Libras Planta} - \text{Libras Camaronera}$

---

## 📂 Estructura de Archivos del Proyecto

```text
IndicadoresCofimar/
├── docker-compose.yml          # Configuración del entorno de microservicios
├── BASE INDICADORES 2026.xlsm  # Libro de Excel original
├── README.md                   # Documentación principal
│
├── backend/                    # Código del Backend FastAPI
│   ├── Dockerfile
│   ├── requirements.txt        # Dependencias de Python
│   ├── database.py             # Configuración de conexiones (Postgres/SQLite)
│   ├── main.py                 # Punto de entrada de la API
│   ├── models.py               # Modelos SQLAlchemy
│   ├── schemas.py              # Esquemas Pydantic
│   ├── routers/                # Endpoints de la API
│   │   ├── catalog.py
│   │   ├── cycles.py
│   │   ├── harvests.py
│   │   ├── import_api.py
│   │   └── summary.py
│   └── services/               # Lógica del Importador y KPIs
│       ├── importer.py
│       └── kpi_calculator.py
│
└── frontend/                   # Código del Frontend React
    ├── Dockerfile
    ├── index.html
    ├── package.json
    ├── tailwind.config.js      # Configuración de Tailwind CSS
    └── src/
        ├── App.tsx             # Coordinador de rutas
        ├── index.css           # Estilos base y variables CSS
        ├── api/                # Cliente Axios para consumo de API
        ├── components/         # Componentes transversales
        └── pages/              # Páginas del Dashboard y Reportes
```
