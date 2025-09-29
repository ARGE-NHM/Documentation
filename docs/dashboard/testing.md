---
title: Testing & Integration
description: Integrationstests und Testumgebungen
sidebar_position: 6
---

# Testing & Integration

Umfassende Teststrategie für die NHMzh Visualisierungs-Services mit verschiedenen Testumgebungen.

## Testumgebungen

### 1. Integration Tests (`integration-tests/`)

**Zweck**: Vollständiger End-to-End-Test vom IFC-Upload bis zur Azure SQL-Speicherung.

#### Setup

```bash
cd integration-tests
# IFC-Datei hinzufügen
mkdir assets
cp your-file.ifc assets/test.ifc

# Dependencies installieren
cd test
go mod tidy

# Services starten
cd ..
docker compose up --build -d
```

#### Test-Ablauf

```bash
# Test ausführen
cd test
go run main.go
```

**Was wird getestet:**

- IFC-Datei-Upload zu MinIO
- Kafka-Nachrichtenverarbeitung
- Fragment-Generierung
- Eigenschaftsextraktion
- LCA/Cost-Datenverarbeitung
- Azure SQL-Speicherung
- PowerBI-Server-Fragment-Zugriff

#### Verifikation

1. **MinIO Console**: http://localhost:9001

   - `ifc-files` Bucket erstellt
   - Test-IFC-Datei hochgeladen
   - `ifc-fragment-files` Bucket mit Fragmenten

2. **Azure SQL**: Verbindung über VSCode mssql Extension

   - `element_data` Tabelle mit EAV-Daten
   - `material_data` Tabelle mit Material-Layern
   - `updates` Tabelle mit Metadaten

3. **Automatische Tests**: Fragment-Zugriff über PowerBI-Server

### 2. Docker Hub Tests (`docker-tests/`)

**Zweck**: Test der veröffentlichten Docker-Images aus Docker Hub.

#### Setup

```bash
cd docker-tests
# Images pullen
docker compose pull

# .env für Azure Cloud Services erstellen
cat > .env << EOF
AZURE_DB_SERVER=your-server.database.windows.net
AZURE_DB_PORT=1433
AZURE_DB_USER=your-user
AZURE_DB_PASSWORD=your-password
AZURE_DB_DATABASE=your-database

AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-storage-key
AZURE_STORAGE_URL=your-storage-url
EOF

# Services starten
docker compose --env-file .env up -d
```

### 3. Cloud Tests (`cloud-tests/`)

**Zweck**: Integration mit echten Azure Cloud Services für PowerBI-Entwicklung.

#### Setup

```bash
cd cloud-tests
# .env für Azure Cloud Services
cat > .env << EOF
AZURE_DB_SERVER=your-server.database.windows.net
AZURE_DB_PORT=1433
AZURE_DB_USER=your-user
AZURE_DB_PASSWORD=your-password
AZURE_DB_DATABASE=your-database

AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-storage-key
AZURE_STORAGE_URL=your-storage-url
EOF

# Services starten
docker compose --env-file .env up -d

# Integration Test ausführen
cd ../integration-tests/test
go run main.go
```

## Test-Daten

### IFC-Testdateien

- `test.ifc` - Basis-Testdatei
- `test2.ifc`, `test3.ifc`, `test4.ifc` - Erweiterte Testszenarien

### Mock-Services

- **mock_calc_lca-cost**: Simuliert LCA- und Kostenberechnungen
- Generiert konsistente Testdaten basierend auf IFC-Elementen

## Test-Automatisierung

### Go Integration Tests

```go
// Beispiel Test-Struktur
func TestFullIntegration(t *testing.T) {
    // 1. IFC-Datei zu MinIO hochladen
    uploadIFCFile("test.ifc")

    // 2. Kafka-Nachricht senden
    sendKafkaMessage(filePath)

    // 3. Warten auf Verarbeitung
    waitForProcessing()

    // 4. Fragment-Zugriff testen
    fragment := getFragmentFromPBI("project1/test")
    assert.NotNil(t, fragment)

    // 5. Azure SQL-Daten prüfen
    elementData := getElementDataFromSQL()
    assert.Greater(t, len(elementData), 0)
}
```

### Docker Compose Test-Setup

```yaml
# integration-tests/docker-compose.yml
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"

  kafka:
    image: confluentinc/cp-kafka
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      SA_PASSWORD: "YourStrong@Passw0rd"
      ACCEPT_EULA: "Y"
```

## Test-Validierung

### Erwartete Ergebnisse

#### MinIO Buckets

- ✅ `ifc-files`: Original IFC-Dateien
- ✅ `ifc-fragment-files`: Komprimierte Fragment-Dateien
- ✅ `lca-cost-data`: Parquet-Datendateien

#### Azure SQL Tabellen

- ✅ `element_data`: EAV-Format Elementeigenschaften
- ✅ `material_data`: EAV-Format Material-Layer
- ✅ `updates`: Metadaten für Datenupdates

#### PowerBI-Server Endpunkte

- ✅ `/fragments?id=project/file`: Fragment-Download
- ✅ `/fragments/list`: Fragment-Liste
- ✅ `/data?project=X&file=Y`: Daten-Download
- ✅ `/data/list`: Daten-Liste

### Fehlerbehandlung Tests

- ❌ Ungültige API-Keys
- ❌ Nicht existierende Dateien
- ❌ Kafka-Verbindungsfehler
- ❌ MinIO-Verbindungsfehler
- ❌ Azure SQL-Verbindungsfehler

## Continuous Integration

### GitHub Actions (Beispiel)

```yaml
name: Integration Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Integration Tests
        run: |
          cd integration-tests
          docker compose up -d
          cd test
          go run main.go
```

## Debugging Tests

### Log-Analyse

```bash
# Service-Logs anzeigen
docker compose logs -f viz_ifc
docker compose logs -f viz_lca-cost
docker compose logs -f viz_pbi-server

# Kafka-Topics prüfen
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

### MinIO Console

- URL: http://localhost:9001
- Login: ROOTUSER / CHANGEME123
- Bucket-Inhalte prüfen
- Fragment-Dateien herunterladen

### Azure SQL Debugging

```sql
-- Element-Daten prüfen
SELECT * FROM element_data WHERE project = 'test-project';

-- Material-Daten prüfen
SELECT * FROM material_data WHERE project = 'test-project';

-- Updates prüfen
SELECT * FROM updates ORDER BY timestamp DESC;
```
