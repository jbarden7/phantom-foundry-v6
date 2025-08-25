# Playwright image includes Chromium + OS deps, so no root/sudo needed
FROM mcr.microsoft.com/playwright/python:v1.47.0-jammy

# Workdir inside container
WORKDIR /app

# Copy and install Python deps first (better Docker layer caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the backend code
# (The build context is the backend/ folder, so "." = backend/)
COPY . /app/backend

# Make "backend" importable as a package from /app
ENV PYTHONPATH=/app

# Expose the port Render will probe
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "backend.app_main:app", "--host", "0.0.0.0", "--port", "8000"]
