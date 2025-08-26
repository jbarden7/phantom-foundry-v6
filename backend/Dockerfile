# Playwright image includes Chromium + OS deps preinstalled
FROM mcr.microsoft.com/playwright/python:v1.47.0-jammy

WORKDIR /app

# Install Python deps (requirements.txt must be in backend/)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy all backend source from the build context (Render root dir = backend/)
COPY . /app/backend

# Make "backend" importable as a package from /app
ENV PYTHONPATH=/app

EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "backend.app_main:app", "--host", "0.0.0.0", "--port", "8000"]
