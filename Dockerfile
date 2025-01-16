FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends sqlite3 && \
    pip install --upgrade pip

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN sqlite3 /app/database/data.db < /app/database/init.sql

EXPOSE 80

CMD ["gunicorn", "--bind", "0.0.0.0:80", "app:app"]
