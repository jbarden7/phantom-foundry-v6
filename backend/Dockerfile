# backend/Dockerfile

FROM mcr.microsoft.com/playwright/python:v1.47.0-jammy
WORKDIR /app

# install deps first for better caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy the backend source (build context is backend/, so '.' is this folder)
COPY . /app/backend

# let Python import "backend" package from /app
ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "backend.app_main:app", "--host", "0.0.0.0", "--port", "8000"]
