# Usamos una imagen ligera de Python
FROM python:3.9-slim

# Instalamos sqlite3 (cliente CLI) para poder ejecutar el script SQL
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Evita que Python genere archivos .pyc y buffer de salida
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Instalamos la herramienta visual 'sqlite-web'
RUN pip install --no-cache-dir sqlite-web

# Copiamos el script de inicialización
COPY intro.sql /usr/local/bin/intro.sql

# Definimos el directorio de trabajo donde se guardará la DB
WORKDIR /data

# Exponemos el puerto donde correrá la interfaz web
EXPOSE 8080

# COMANDO DE ARRANQUE:
# 1. Verifica si la tabla 'users' existe. Si no, ejecuta intro.sql.
# 2. Lanza sqlite_web.
CMD ["sh", "-c", "if [ -z \"$(sqlite3 /data/database.sqlite \"SELECT name FROM sqlite_master WHERE type='table' AND name='users';\")\" ]; then echo 'Inicializando Base de Datos...'; sqlite3 /data/database.sqlite < /usr/local/bin/intro.sql; fi; echo 'Iniciando SQLite Web...'; sqlite_web /data/database.sqlite -H 0.0.0.0 -p 8080"]