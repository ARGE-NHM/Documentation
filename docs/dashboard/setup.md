---
title: Setup & Entwicklungsumgebung
description: Lokale Entwicklungsumgebung einrichten
sidebar_position: 4
---

# Setup & Entwicklungsumgebung

Anleitung zur Einrichtung der lokalen Entwicklungsumgebung für die NHMzh Visualisierungs-Services.

## Voraussetzungen

- **Docker** & **Docker Compose**
- **Node.js** (für viz_ifc Service)
- **Go** 1.20+ (für viz_lca-cost und viz_pbi-server)
- **Azure SQL Server Emulator** (VSCode Extension 'mssql')

## Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis:

```bash
ENVIRONMENT=production

# MinIO Konfiguration
MINIO_ACCESS_KEY=ROOTUSER
MINIO_SECRET_KEY=CHANGEME123
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false

# MinIO Buckets
MINIO_IFC_BUCKET=ifc-files
VIZ_FRAGMENTS_BUCKET=ifc-fragment-files
MINIO_LCA_COST_DATA_BUCKET=lca-cost-data

# Kafka Konfiguration
VIZ_KAFKA_IFC_CONSUMER_ID=viz-ifc-consumer
VIZ_KAFKA_IFC_GROUP_ID=viz-ifc
VIZ_KAFKA_DATA_GROUP_ID=viz-data
KAFKA_BROKER=kafka:9093
KAFKA_IFC_TOPIC=ifc-files
KAFKA_LCA_TOPIC=lca-data
KAFKA_COST_TOPIC=cost-data

# PowerBI Server
PBI_SERVER_PORT=3000

# Azure SQL Database
AZURE_DB_SERVER=your-server-name.database.windows.net
AZURE_DB_PORT=1433
AZURE_DB_USER=your-user-name
AZURE_DB_PASSWORD=your-password
AZURE_DB_DATABASE=your-database-name
```

### Entwicklungsumgebung

Für lokale Integrationstests erstelle eine `.env.dev` Datei:

```bash
# Azure DB für lokale Entwicklung
AZURE_DB_SERVER=host.docker.internal
AZURE_DB_PORT=1234
AZURE_DB_USER=your-user-name
AZURE_DB_PASSWORD=your-password
AZURE_DB_DATABASE=your-database-name

ENVIRONMENT=development
```

## Services starten

### Vollständige Services

```bash
# Im Root-Verzeichnis
docker-compose up --build -d
```

### Einzelne Services entwickeln

#### viz_ifc (Node.js/TypeScript)

```bash
cd viz_ifc
npm install
npm run dev
```

#### viz_lca-cost (Go)

```bash
cd viz_lca-cost
go mod tidy
go run main.go
```

#### viz_pbi-server (Go)

```bash
cd viz_pbi-server
go mod tidy
go run main.go
```

## Services verwalten

### Services stoppen

```bash
docker-compose down
```

### Logs anzeigen

```bash
docker-compose logs -f [service-name]
```

### Services neu starten

```bash
docker-compose restart [service-name]
```

## MinIO Console

Zugriff auf die MinIO-Verwaltungsoberfläche:

- **URL**: http://localhost:9001
- **Login**: ROOTUSER / CHANGEME123 (oder deine .env Werte)

## Entwicklungstools

### VSCode Extensions

Empfohlene Extensions:

- **mssql**: Azure SQL Server Emulator
- **Docker**: Container-Verwaltung
- **Go**: Go-Entwicklung
- **TypeScript**: TypeScript-Unterstützung

### Debugging

#### Node.js Services

```bash
# Debug-Modus für viz_ifc
cd viz_ifc
npm run debug
```

#### Go Services

```bash
# Debug-Modus für Go Services
dlv debug main.go
```

## Häufige Probleme

### Port-Konflikte

- Stelle sicher, dass Ports 3000, 9000, 9001, 9093 frei sind
- Verwende `docker-compose ps` um laufende Container zu prüfen

### MinIO-Verbindungsfehler

- Prüfe MINIO_ENDPOINT und MINIO_PORT in .env
- Stelle sicher, dass MinIO-Container läuft

### Kafka-Verbindungsfehler

- Prüfe KAFKA_BROKER Konfiguration
- Warte bis alle Services vollständig gestartet sind

### Azure SQL Verbindung

- Prüfe Firewall-Einstellungen für Azure SQL
- Verwende lokale Emulatoren für Entwicklung
