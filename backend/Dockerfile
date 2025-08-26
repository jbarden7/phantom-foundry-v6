FROM mcr.microsoft.com/playwright/python:v1.47.0-jammy

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

RUN echo "=== /app contents ===" && ls -la /app && \
    echo "=== /app/routes contents ===" && ls -la /app/routes || true

ENV PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "app_main:app", "--host", "0.0.0.0", "--port", "8000"]
