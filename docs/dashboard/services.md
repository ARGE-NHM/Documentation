---
title: Service-Details
description: Technische Details der einzelnen Services
sidebar_position: 5
---

# Service-Details

Detaillierte technische Beschreibung der drei Hauptservices im NHMzh Visualisierungs-System.

## viz_ifc - IFC-Verarbeitungsservice

### Zweck

Konvertiert IFC-Dateien zu komprimierten Fragmenten für performante 3D-Visualisierung in WebGL-Viewern.

### Technologie-Stack

- **Runtime**: Node.js/TypeScript
- **IFC-Bibliothek**: @ThatOpen Companies (web-ifc)
- **Komprimierung**: Gzip für Fragment-Dateien

### Verantwortlichkeiten

#### Kafka Consumer

- Hört auf `KAFKA_IFC_TOPIC` für neue IFC-Datei-Benachrichtigungen
- Lädt IFC-Dateien aus MinIO herunter
- Verarbeitet Dateien asynchron

#### IFC-zu-Fragment Konvertierung

```typescript
// Fragment-Erstellung
const fragments = await ifcParser.convertToFragments(ifcFile);
const compressedFragments = await compress(fragments);
await minioClient.upload(fragmentsBucket, fragmentPath, compressedFragments);
```

#### Eigenschaftsextraktion

- Extrahiert Elementeigenschaften mit web-ifc
- Konfigurierbare Eigenschaften über `IFC_PROPERTIES_TO_INCLUDE`
- Standard-Eigenschaften: Reference, LoadBearing, FireRating, Name, category, level, ebkph

### Konfiguration

```bash
IFC_PROPERTIES_TO_INCLUDE=Reference,LoadBearing,FireRating,Name,category,level,ebkph
VIZ_KAFKA_IFC_CONSUMER_ID=viz-ifc-consumer
VIZ_KAFKA_IFC_GROUP_ID=viz-ifc
```

---

## viz_lca-cost - LCA & Kosten-Service

### Zweck

Verarbeitet LCA- und Kostendaten aus Kafka-Topics und speichert sie im EAV-Format für langfristige Berichterstattung.

### Technologie-Stack

- **Runtime**: Go
- **Datenbank**: Azure SQL Server
- **Datenformat**: EAV (Element-Attribute-Value)

### Verantwortlichkeiten

#### Dual Kafka Consumer

```go
// LCA Consumer
lcaConsumer := kafka.NewConsumer(KAFKA_LCA_TOPIC, "viz-lca-group")
costConsumer := kafka.NewConsumer(KAFKA_COST_TOPIC, "viz-cost-group")
```

#### Datenverarbeitung

- Konvertiert Row/Object-Format zu EAV-Format
- Gruppiert Daten nach Elementen und Material-Layern
- Erstellt Zeitstempel für historische Nachverfolgung

#### Azure SQL Integration

- Schreibt verarbeitete Daten in Azure SQL DB
- Unterstützt sowohl lokale Emulatoren als auch Cloud-Instanzen
- EAV-Schema für flexible Eigenschaftserweiterung

### Datenmodell

```sql
-- Element-Daten (EAV)
CREATE TABLE element_data (
    project VARCHAR(255),
    filename VARCHAR(255),
    id VARCHAR(255),
    timestamp DATETIME,
    param_name VARCHAR(255),
    param_value TEXT
);

-- Material-Layer-Daten (EAV)
CREATE TABLE material_data (
    project VARCHAR(255),
    filename VARCHAR(255),
    id VARCHAR(255),
    sequence INT,
    timestamp DATETIME,
    param_name VARCHAR(255),
    param_value TEXT
);
```

---

## viz_pbi-server - PowerBI Integration Server

### Zweck

Stellt REST-API-Endpunkte für PowerBI-Integration bereit und fungiert als Proxy zwischen PowerBI und Azure-Services.

### Technologie-Stack

- **Runtime**: Go
- **Storage**: MinIO für Fragment-Dateien
- **Authentifizierung**: API-Key-basiert
- **Proxy**: Reverse Proxy-kompatibel

### Verantwortlichkeiten

#### Fragment-Serving

```go
// Fragment-Datei bereitstellen
func (s *Server) GetFragment(w http.ResponseWriter, r *http.Request) {
    projectFile := r.URL.Query().Get("id")
    fragmentData, err := s.minioClient.GetFragment(projectFile)
    // Komprimierte .gz-Datei zurückgeben
}
```

#### API-Sicherheit

- API-Key-Authentifizierung für alle Endpunkte
- Unterstützung für Reverse Proxy (TLS-Terminierung)
- Header-basierte Protokoll-Erkennung

#### Datenzugriff

- Parquet-Dateien für historische Daten
- Direkter Azure SQL-Zugriff für PowerBI Direct Query
- Projekt-basierte Ordnerstruktur

### Konfiguration

```bash
PBI_SERVER_PORT=3000
PBI_SRV_API_KEY=your-secret-key
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=ROOTUSER
MINIO_SECRET_KEY=CHANGEME123
VIZ_IFC_FRAGMENTS_BUCKET=ifc-fragment-files
```

## Service-Interaktionen

### Datenfluss zwischen Services

**Service-Interaktionen:**

1. **viz_ifc** → **MinIO**: Upload Fragment-Dateien für 3D-Visualisierung
2. **viz_ifc** → **viz_lca-cost** (Kafka): Send Element Properties für Datenverarbeitung
3. **viz_lca-cost** → **Azure SQL**: Store EAV Data für PowerBI-Zugriff
4. **viz_pbi-server** → **MinIO**: Retrieve Fragments für 3D-Viewer
5. **viz_pbi-server** → **Azure SQL**: Direct Query Access für Dashboard-Daten

### Fehlerbehandlung

#### Retry-Mechanismen

- Exponential Backoff für Kafka-Consumer
- Circuit Breaker für externe Service-Calls
- Dead Letter Queues für fehlgeschlagene Nachrichten

#### Monitoring

- Strukturierte Logs mit Correlation IDs
- Health-Check-Endpunkte für alle Services
- Metriken für Verarbeitungszeiten und Fehlerraten
