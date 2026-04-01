# 🚀 LOCAL SETUP GUIDE - SPOOLMAN-MASTER

Complete guide to set up Spoolman-Master locally with Docker, including different port configurations and HTTP/HTTPS setup.

---

## 📋 TABLE OF CONTENTS

1. [Quick Start](#quick-start)
2. [Different Port Configurations](#different-port-configurations)
3. [HTTP vs HTTPS Setup](#http-vs-https-setup)
4. [Docker Compose Configuration](#docker-compose-configuration)
5. [Environment Variables](#environment-variables)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 QUICK START

### Prerequisites
- Docker installed
- Docker Compose installed
- Git installed

### Clone Repository

```bash
git clone https://github.com/GrandM1961/Spoolman.git
cd Spoolman
```

### Start Default (Port 8000)

```bash
docker compose -f docker-compose-unified.yml up -d spoolman
```

Access at: **http://localhost:8000**

---

## 🔧 DIFFERENT PORT CONFIGURATIONS

### Option 1: Use Port 8000 (Default)

```bash
docker compose -f docker-compose-unified.yml up -d spoolman
```

**Access:** http://localhost:8000

---

### Option 2: Use Port 3000

Edit `docker-compose-unified.yml`:

```yaml
services:
  spoolman:
    ports:
      - "3000:8000"  # Change from 8000:8000 to 3000:8000
```

Then:

```bash
docker compose -f docker-compose-unified.yml up -d spoolman
```

**Access:** http://localhost:3000

---

### Option 3: Use Port 5000

Edit `docker-compose-unified.yml`:

```yaml
services:
  spoolman:
    ports:
      - "5000:8000"  # Change to 5000:8000
```

Then:

```bash
docker compose -f docker-compose-unified.yml up -d spoolman
```

**Access:** http://localhost:5000

---

### Option 4: Use Custom Port (Example: 9000)

Edit `docker-compose-unified.yml`:

```yaml
services:
  spoolman:
    ports:
      - "9000:8000"  # Use any port you want
```

Then:

```bash
docker compose -f docker-compose-unified.yml up -d spoolman
```

**Access:** http://localhost:9000

---

## 🔐 HTTP vs HTTPS SETUP

### HTTP Setup (Simple - Default)

HTTP is **not secure** but works locally for development.

```yaml
services:
  spoolman:
    ports:
      - "8000:8000"  # HTTP port
```

**Access:** http://localhost:8000

**Use Case:** Development, local testing

---

### HTTPS Setup (Secure)

HTTPS requires SSL certificates. There are several ways:

#### Method 1: Using Self-Signed Certificate (Easiest)

Generate self-signed certificate:

```bash
# Create certificates directory
mkdir -p ~/spoolman-certs

# Generate certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout ~/spoolman-certs/key.pem \
  -out ~/spoolman-certs/cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

Edit `docker-compose-unified.yml`:

```yaml
services:
  spoolman-nginx:
    image: nginx:alpine
    container_name: spoolman-nginx
    ports:
      - "8443:443"  # HTTPS port
    volumes:
      - /path/to/nginx.conf:/etc/nginx/nginx.conf:ro
      - ~/spoolman-certs/cert.pem:/etc/nginx/cert.pem:ro
      - ~/spoolman-certs/key.pem:/etc/nginx/key.pem:ro
```

**Access:** https://localhost:8443 (browser will show security warning - that's normal for self-signed)

---

#### Method 2: Using Let's Encrypt (For Production)

Only works if you have a real domain name.

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx  # Linux
# or
brew install certbot  # macOS

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com
```

Certificates will be in `/etc/letsencrypt/live/yourdomain.com/`

Then update docker-compose:

```yaml
volumes:
  - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/cert.pem:ro
  - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/key.pem:ro
```

---

## 📄 DOCKER COMPOSE CONFIGURATION

### Full docker-compose-unified.yml Example

```yaml
version: '3.8'

services:
  spoolman:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: spoolman
    ports:
      - "8000:8000"  # ← CHANGE THIS PORT
    environment:
      - SPOOLMAN_DATA_DIR=/home/app/.local/share/spoolman
      - SPOOLMAN_HOST=0.0.0.0
      - SPOOLMAN_PORT=8000
    volumes:
      - spoolman_data:/home/app/.local/share/spoolman
    restart: unless-stopped
    networks:
      - spool-network

  spoolman-nginx:
    image: nginx:alpine
    container_name: spoolman-nginx
    ports:
      - "80:80"      # ← CHANGE HTTP PORT
      - "443:443"    # ← CHANGE HTTPS PORT
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./cert.pem:/etc/nginx/cert.pem:ro    # For HTTPS
      - ./key.pem:/etc/nginx/key.pem:ro      # For HTTPS
    depends_on:
      - spoolman
    restart: unless-stopped
    networks:
      - spool-network

volumes:
  spoolman_data:
    driver: local

networks:
  spool-network:
    driver: bridge
```

---

## 🌍 ENVIRONMENT VARIABLES

### Common Settings

```yaml
environment:
  # Data directory (where database is stored)
  - SPOOLMAN_DATA_DIR=/home/app/.local/share/spoolman
  
  # Server binding
  - SPOOLMAN_HOST=0.0.0.0  # Listen on all interfaces
  - SPOOLMAN_PORT=8000      # Container port
  
  # Database
  - SPOOLMAN_DB_TYPE=sqlite  # or mysql, postgres, cockroachdb
  
  # Backups
  - SPOOLMAN_AUTOMATIC_BACKUP=TRUE
  
  # Debug mode
  - SPOOLMAN_DEBUG_MODE=FALSE
```

---

## 🔐 SSL/TLS CERTIFICATES

### Create Self-Signed Certificate

```bash
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

### Renew Certificate

```bash
# Remove old
rm cert.pem key.pem

# Generate new
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -subj "/CN=localhost"

# Restart containers
docker compose restart spoolman-nginx
```

---

## 🎯 QUICK REFERENCE

### Change Port

```bash
# Edit docker-compose-unified.yml
# Change: "8000:8000" to "YOUR_PORT:8000"
# Save and run:
docker compose up -d spoolman
```

### View Running Container

```bash
docker ps | grep spoolman
```

### View Logs

```bash
docker logs spoolman -f
```

### Stop Spoolman

```bash
docker compose down
```

### Restart Spoolman

```bash
docker compose restart spoolman
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Use a different port in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker logs spoolman

# Verify docker-compose.yml syntax
docker compose config

# Try rebuilding
docker compose build --no-cache spoolman
```

### Can't Connect to Container

```bash
# Check if container is running
docker ps | grep spoolman

# Check network
docker network inspect spool-network
```

### HTTPS Certificate Issues

```bash
# Browser shows security warning?
# This is normal for self-signed certificates
# Click "Advanced" → "Proceed anyway" (or similar)
```

---

## 🎉 YOU'RE READY!

Your Spoolman-Master is set up and ready to use!
