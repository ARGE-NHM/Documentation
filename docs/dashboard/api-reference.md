---
title: API-Referenz
description: PowerBI-Server API-Endpunkte und Authentifizierung
sidebar_position: 3
---

# API-Referenz

Der PowerBI-Server (`viz_pbi-server`) stellt REST-API-Endpunkte für die Integration mit PowerBI-Dashboards bereit.

## Authentifizierung

Alle Endpunkte sind durch API-Key-Authentifizierung geschützt. Der API-Key muss im `X-API-Key` Header mit jeder Anfrage gesendet werden.

### Konfiguration

```bash
PBI_SRV_API_KEY=your-secret-api-key
```

## Endpunkte

### Fragment-Datei abrufen

**GET** `/blob`

Liefert eine komprimierte Fragment-Datei (.gz) für 3D-Visualisierung in PowerBI.

**Parameter:**

- `id` (query): Datei-ID im Format `project/filename_timestamp.gz`
- `container` (query, optional): Storage-Container-Name (Standard: konfigurierter Bucket)

**Beispiel:**

```bash
curl -H "X-API-Key: your-api-key" \
     "http://localhost:3000/blob?id=project1/building1_20240115.gz"
```

### Fragment-Datei hochladen

**POST** `/blob`

Lädt eine komprimierte Fragment-Datei in den Storage hoch.

**Parameter:**

- `container` (query, optional): Storage-Container-Name
- Datei-Daten im multipart-Format

**Beispiel:**

```bash
curl -X POST -H "X-API-Key: your-api-key" \
     -F "file=@fragment.gz" \
     "http://localhost:3000/blob?container=ifc-fragment-files"
```

### Element-Daten speichern

**POST** `/data/elements`

Empfängt und speichert verarbeitete Element-Daten vom viz_lca-cost Service.

**Content-Type:** `application/json`

**Beispiel:**

```bash
curl -X POST -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"project":"project1","filename":"building1",...}' \
     "http://localhost:3000/data/elements"
```

### Material-Daten speichern

**POST** `/data/materials`

Empfängt und speichert verarbeitete Material-Daten vom viz_lca-cost Service.

**Content-Type:** `application/json`

**Beispiel:**

```bash
curl -X POST -H "X-API-Key: your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"project":"project1","filename":"building1",...}' \
     "http://localhost:3000/data/materials"
```

### CORS Preflight

**OPTIONS** `/{path:.*}`

Behandelt CORS Preflight-Anfragen für PowerBI-Integration.

**Hinweis:** Keine Authentifizierung für OPTIONS-Anfragen erforderlich.

## Fehlerbehandlung

### HTTP-Status-Codes

- `200 OK`: Erfolgreiche Anfrage
- `400 Bad Request`: Ungültige Parameter
- `401 Unauthorized`: Fehlender oder ungültiger API-Key
- `404 Not Found`: Angeforderte Ressource nicht gefunden
- `500 Internal Server Error`: Serverfehler

### Beispiel-Fehlerantwort

```json
{
	"error": "Unauthorized",
	"message": "Invalid or missing API key"
}
```

## PowerBI-Integration

### 3D-Viewer Custom Visual

Das PowerBI Custom Visual für IFC-Viewer kann Fragment-Dateien direkt vom Server laden:

```javascript
// Fragment-Datei laden
const fragmentUrl = `${serverUrl}/blob?id=${projectId}/${fileId}_${timestamp}.gz`;
const response = await fetch(fragmentUrl, {
	headers: {
		"X-API-Key": apiKey,
	},
});
```

### Direct Query für Daten

PowerBI kann direkt auf die Azure SQL-Datenbank zugreifen für Echtzeitdaten ohne API-Umweg.

## Sicherheit

### Reverse Proxy Setup

Der Service ist für den Betrieb hinter einem Reverse Proxy (Nginx, Traefik, HAProxy) konzipiert:

- TLS-Terminierung (HTTPS)
- Zertifikatsverwaltung
- HTTP zu HTTPS-Weiterleitung

Unterstützte Proxy-Header:

- `X-Forwarded-Proto`: Ursprüngliches Protokoll (http/https)
- `X-Forwarded-Host`: Ursprünglicher Host
