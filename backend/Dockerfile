FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create the backend package structure inside /app
RUN mkdir -p /app/backend
COPY . /app/backend/

# Copy the Excel data file if present (for initial seeding)
# The seed file lives at the repo root, but with Root Directory=/backend
# it won't be in the build context. We handle this gracefully in main.py.

EXPOSE 8000

# Use shell form so $PORT is expanded at runtime
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
