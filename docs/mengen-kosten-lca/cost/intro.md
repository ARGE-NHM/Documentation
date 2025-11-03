---
title: NHMzh Kostenberechnung
sidebar_label: Kostenberechnung
description: Kostenmodul im NHMzh Nachhaltigkeitsmonitoring
---

# NHMzh Kostenberechnung

**Kostenkennwerte auf BIM-Daten anwenden** – Automatische Berechnung von Baukosten basierend auf eBKP-Klassifizierung und Mengen aus IFC-Modellen.

## Was ist Kostenberechnung?

Die Kostenberechnung ist der zweite Schritt im NHMzh-Workflow. Sie:

- Liest Mengen- und Bauteildaten direkt aus der QTO-Datenbank
- Verknüpft Bauteile mit Kostenkennwerten basierend auf eBKP-Codes
- Berechnet Gesamtkosten pro Bauteil und Projekt
- Gruppiert Kosten hierarchisch nach eBKP-Struktur

Die berechneten Kosten werden in der `cost`-Datenbank gespeichert und können für weitere Analysen verwendet werden.

## Grundprinzip der Kostenberechnung

### Berechnungsformel

```
Elementkosten = Menge × Kostenkennwert (CHF/Einheit)
```

**Beispiel:**
- Bauteil: Aussenwand
- Menge: 125.5 m²
- Kostenkennwert: 450 CHF/m²
- Gesamtkosten: 125.5 × 450 = 56,475 CHF

### eBKP-Matching

Das System sucht für jedes Bauteil den passenden Kostenkennwert über den eBKP-Code:

1. **Exakte Übereinstimmung**: Zuerst wird nach einer exakten Übereinstimmung gesucht (z.B. `C2.01`)
2. **Hierarchische Zuordnung**: Falls keine exakte Übereinstimmung gefunden wird, wird die Hierarchie nach oben durchsucht (z.B. `C2.01` → `C2` → `C`)

Siehe auch: [Berechnungslogik](../generelles/berechnungslogik#2-kostenberechnung)

## Workflow

### 1. Projektauswahl

Im Frontend wählen Sie ein bereits freigegebenes QTO-Projekt aus:

- Nur Projekte mit Status "freigegeben" sind verfügbar
- Projektliste zeigt Anzahl Elemente und letzten Bearbeitungsstand
- Direkte Verknüpfung mit QTO-Daten (keine erneute Datenübertragung nötig)

### 2. Kostenkennwerte verwalten

Kostenkennwerte werden pro Projekt und eBKP-Code verwaltet:

**Verfügbare eBKP-Codes:**
Das System zeigt alle in den QTO-Daten vorhandenen eBKP-Codes an. Sie können Kennwerte für beliebige Codes definieren.

**Kennwert-Format:**
- eBKP-Code (z.B. `C2.01`)
- Kostenkennwert in CHF/Einheit (z.B. `450`)
- Einheit basierend auf Elementtyp (m², m, m³)

### 3. Excel-Upload von Kostenkennwerten

Sie können Kostenkennwerte aus Excel-Dateien importieren:

**Excel-Format:**
- Spalte `eBKP_Code`: eBKP-Klassifizierung
- Spalte `Kostenkennwert`: Wert in CHF/Einheit
- Optionale Spalten: Beschreibung, Einheit, etc.

**Upload-Prozess:**
1. Excel-Datei auswählen
2. Datei hochladen
3. System validiert Format und Codes
4. Kennwerte werden gespeichert

### 4. Kostenberechnung

Nach dem Speichern der Kostenkennwerte:

1. **Automatische Berechnung**: System verknüpft alle Bauteile mit passenden Kennwerten
2. **Berechnung pro Element**: `Menge × Kostenkennwert`
3. **Hierarchische Gruppierung**: Kosten werden nach eBKP-Struktur gruppiert
4. **Gesamtsummen**: Automatische Berechnung von Teil- und Gesamtsummen

### 5. Kostenprüfung und Bestätigung

Nach der Berechnung können Sie die Ergebnisse prüfen:

**Anzeige:**
- Kosten pro Bauteil
- Gruppierung nach eBKP-Codes
- Gesamtkosten pro Kategorie
- Projekt-Gesamtkosten

**Prüfung:**
- Plausibilität der Einzelkosten
- Vollständigkeit der Zuordnungen
- Korrekte Verwendung der Kennwerte

**Bestätigung:**
- Nach erfolgreicher Prüfung können Kosten bestätigt werden
- Bestätigte Kosten werden an Kafka gesendet (für Dashboard)
- Status ändert sich zu "bestätigt"

## Funktionsumfang

### Direkte QTO-Integration

Das Cost-Plugin liest Daten direkt aus der QTO-Datenbank:

- Keine manuelle Datenübertragung erforderlich
- Automatische Synchronisation bei QTO-Änderungen
- Direkte Verknüpfung über `qto_element_id`

### Kostenkennwert-Import

**Unterstützte Formate:**
- Excel-Dateien (.xlsx, .xls)
- CSV-Dateien
- Manuelle Eingabe über UI

**Validierung:**
- eBKP-Code-Format-Prüfung
- Kostenwert-Validierung (positive Zahlen)
- Einheiten-Konsistenz-Prüfung

### Automatische Kostenberechnung

**Berechnungslogik:**
- Verknüpfung über eBKP-Codes
- Hierarchisches Matching (falls exakter Code nicht vorhanden)
- Behandlung fehlender Kennwerte (Warnung, keine Fehler)

### Hierarchische Kostendarstellung

Kosten werden nach eBKP-Struktur gruppiert:

**Beispiel:**
```
C - Tragkonstruktion
  └─ C2 - Wandkonstruktion
      └─ C2.01 - Aussenwandkonstruktion
          ├─ Element 1: 56,475 CHF
          ├─ Element 2: 43,200 CHF
          └─ Summe C2.01: 99,675 CHF
```

### Datenvisualisierung

Das Frontend bietet verschiedene Ansichten:

- **Tabellenansicht**: Alle Elemente mit Einzelkosten
- **Hierarchische Ansicht**: Gruppierung nach eBKP
- **Summenansicht**: Übersichtliche Gesamtkosten
- **Export**: Excel-Export für weitere Analysen

## Kostenkennwerte verwalten

### Manuelle Eingabe

Sie können Kostenkennwerte direkt im Frontend eingeben:

1. eBKP-Code aus Liste wählen
2. Kostenkennwert eingeben (CHF/Einheit)
3. Speichern
4. Änderungen werden sofort übernommen

### Excel-Import

Für Massenimport von Kostenkennwerten:

**Excel-Vorlage:**
```
eBKP_Code  | Kostenkennwert | Einheit | Beschreibung
-----------|----------------|---------|-------------
C2.01      | 450           | CHF/m²  | Aussenwandkonstruktion
C4.01      | 320           | CHF/m²  | Geschossdecke
D01.01     | 85            | CHF/m²  | Elektroinstallation
```

**Import-Prozess:**
1. Excel-Datei vorbereiten
2. Upload-Funktion verwenden
3. System validiert Daten
4. Fehler werden angezeigt (falls vorhanden)
5. Erfolgreiche Kennwerte werden gespeichert

### Kostenkennwerte bearbeiten

Sie können vorhandene Kennwerte jederzeit ändern:

- Einzelne Kennwerte bearbeiten
- Mehrere Kennwerte gleichzeitig ändern
- Kennwerte löschen

**Hinweis:** Änderungen an Kennwerten erfordern eine Neuberechnung der Kosten.

## Kostenberechnung neu anstossen

Nach Änderungen können Sie die Berechnung neu anstossen:

**Auslöser für Neuberechnung:**
- Neue oder geänderte Kostenkennwerte
- Aktualisierte QTO-Daten
- Manuelle Neuberechnung über Button

**Neuberechnung-Prozess:**
1. Button "Kosten neu berechnen" klicken
2. System verknüpft alle Bauteile neu
3. Berechnet Kosten für alle Elemente
4. Aktualisiert Anzeige

## Ergebnisinterpretation

### Kosten pro Element

Jedes Bauteil zeigt:
- Elementname und IFC-Klasse
- Menge (Fläche, Länge oder Volumen)
- Kostenkennwert (CHF/Einheit)
- Gesamtkosten für dieses Element

### Gruppierte Kosten

Kosten werden hierarchisch nach eBKP-Struktur gruppiert:

- **Kategorie-Ebene** (z.B. C - Tragkonstruktion)
- **Unterkategorie-Ebene** (z.B. C2 - Wandkonstruktion)
- **Detailebene** (z.B. C2.01 - Aussenwandkonstruktion)
- **Element-Ebene** (Einzelne Bauteile)

### Gesamtkosten

Das System berechnet automatisch:
- Gesamtkosten pro eBKP-Kategorie
- Projekt-Gesamtkosten
- Kosten pro m² (falls Energiebezugsfläche vorhanden)

## Häufige Aufgaben

### Kostenkennwerte aus Excel importieren

**Vorbereitung:**
1. Excel-Datei mit eBKP-Codes und Kennwerten erstellen
2. Format prüfen (Spalten: eBKP_Code, Kostenkennwert)
3. Datei speichern

**Import:**
1. Projekt auswählen
2. "Kostenkennwerte importieren" auswählen
3. Excel-Datei auswählen
4. Upload starten
5. Fehler prüfen (falls vorhanden)
6. Erfolgreiche Kennwerte werden gespeichert

### Kosten prüfen und validieren

**Prüfschritte:**
1. Gesamtkosten auf Plausibilität prüfen
2. Einzelne Elemente mit ungewöhnlich hohen/niedrigen Kosten prüfen
3. Fehlende Zuordnungen identifizieren
4. eBKP-Zuordnung korrekt?
5. Mengenangaben korrekt?

### Kosten bestätigen

Nach erfolgreicher Prüfung:

1. "Kosten bestätigen" Button klicken
2. Bestätigung bestätigen
3. Kosten werden an Kafka gesendet
4. Status ändert sich zu "bestätigt"
5. Daten sind für Dashboard verfügbar

## Best Practices

### Kostenkennwerte

- **Aktualität**: Verwenden Sie aktuelle Kostenkennwerte
- **Genauigkeit**: Detaillierte eBKP-Codes führen zu genaueren Kosten
- **Dokumentation**: Dokumentieren Sie Herkunft der Kennwerte
- **Versionierung**: Verwenden Sie konsistente Kennwert-Sätze pro Projekt

### Datenqualität

- **Vollständigkeit**: Stellen Sie sicher, dass alle wichtigen eBKP-Codes Kennwerte haben
- **Konsistenz**: Verwenden Sie einheitliche Einheiten und Rundungen
- **Plausibilität**: Prüfen Sie Berechnungsergebnisse auf Sinnhaftigkeit

### Workflow

- **Iterativ**: Schrittweise Verfeinerung der Kostenkennwerte
- **Validierung**: Regelmässige Prüfung der Berechnungsergebnisse
- **Dokumentation**: Nachvollziehbarkeit aller Änderungen

## Nächste Schritte

Nach erfolgreicher Kostenberechnung können Sie:

1. **[Ökobilanzierung](../lca/intro)**: Umweltauswirkungen berechnen
2. **Dashboard**: Ergebnisse im Dashboard visualisieren

Die Kostenberechnung läuft parallel zur Ökobilanzierung und beide nutzen die gleichen QTO-Daten.

---

<details>
<summary><strong>Entwickler: Architektur & Technische Details</strong></summary>

## Architektur und Datenfluss

Das Cost-Plugin ist eine Webanwendung mit einem React/TypeScript-Frontend (Vite) und einem Node.js/Express-Backend.

### Frontend

- **Technologie**: React 18.3 / TypeScript 5.7
- **Build-Tool**: Vite 6.2
- **Zweck**: Verwaltung von Kostenkennwerten und Visualisierung von berechneten Kosten

**Hauptfunktionen:**
- Projektauswahl
- Kostenkennwert-Verwaltung
- Excel-Upload von Kennwerten
- Kostenberechnung anstossen
- Hierarchische Kostendarstellung
- Kostenbestätigung

### Backend

- **Technologie**: Node.js 18.x / Express / TypeScript
- **Zweck**: REST-API für alle Operationen, Kostenberechnung, Kafka-Integration

**Hauptfunktionen:**
- Direkte QTO-Datenbankabfragen
- Kostenkennwert-Verwaltung
- Kostenberechnung
- MongoDB-Persistierung
- Kafka-Publikation bei Bestätigung

### Datenfluss

1. **Datenabruf**: Das Cost-Backend liest Bauteildaten (Mengen, eBKP-Codes) direkt aus der `qto`-Datenbank
2. **Kostenkennwerte**: Benutzer lädt Kostenkennwerte (CHF/Einheit) pro eBKP-Code über Frontend
3. **Kostenberechnung**: Backend verknüpft Bauteile mit Kostenkennwerten und berechnet Gesamtkosten
4. **Datenspeicherung**: Ergebnisse werden in der `cost`-MongoDB-Datenbank gespeichert
5. **Visualisierung**: Frontend ruft berechnete Kosten vom Backend ab
6. **Bestätigung**: Bei Bestätigung werden Daten an Kafka gesendet

## Datenbank-Schema

### MongoDB-Datenbank: `cost`

### Sammlung: `costElements`

Die wichtigste Sammlung, die eine Kombination aus QTO-Daten und angereicherten Kostendaten darstellt.

**Beispiel-Dokument:**

```json
{
  "_id": ObjectId("..."),
  "qto_element_id": ObjectId("..."),
  "project_id": ObjectId("..."),
  "global_id": "3DqaUydM99ehywE4_2hm1u",
  "ifc_class": "IfcWall",
  "name": "Aussenwand_470mm",
  "quantity": {
    "value": 125.5,
    "type": "area",
    "unit": "m²"
  },
  "classification": {
    "id": "C2.01",
    "system": "eBKP"
  },
  "unit_cost": 450.0,
  "total_cost": 56475.0,
  "currency": "CHF",
  "created_at": ISODate("2024-01-15T10:30:00Z")
}
```

**Felder:**
- `_id`: Eindeutige MongoDB-ID
- `qto_element_id`: Referenz zum Original-Element in `qto.elements`
- `project_id`: Referenz zum Projekt
- `global_id`: IFC GlobalId (für Rückverfolgbarkeit)
- `ifc_class`: IFC-Klasse
- `name`: Elementname
- `quantity`: Mengenangabe (value, type, unit)
- `classification`: eBKP-Klassifizierung
- `unit_cost`: Kostenkennwert in CHF/Einheit
- `total_cost`: Berechnete Gesamtkosten
- `currency`: Währung (standardmässig "CHF")
- `created_at`: Zeitstempel der Berechnung

### Sammlung: `kennwerte`

Speichert Kostenkennwerte pro Projekt und eBKP-Code.

**Beispiel-Dokument:**

```json
{
  "_id": ObjectId("..."),
  "project_id": ObjectId("..."),
  "ebkp_code": "C2.01",
  "unit_cost": 450.0,
  "unit": "CHF/m²",
  "description": "Aussenwandkonstruktion",
  "created_at": ISODate("2024-01-15T10:30:00Z"),
  "updated_at": ISODate("2024-01-15T10:30:00Z")
}
```

## API-Endpunkte

Das Backend stellt folgende REST API-Endpunkte bereit:

| Endpunkt | Methode | Beschreibung | Request Body | Response |
|----------|---------|--------------|--------------|----------|
| `/health` | GET | Health Check | - | `{"status": "ok"}` |
| `/projects` | GET | Liste aller Projekte | - | `[{"id": "...", "name": "..."}]` |
| `/project-elements/:projectName` | GET | Alle Elemente eines Projekts | - | `[{"_id": "...", ...}]` |
| `/available-ebkp-codes` | GET | Verfügbare eBKP-Codes | - | `["C2.01", "C4.01", ...]` |
| `/get-kennwerte/:projectName` | GET | Kostenkennwerte eines Projekts | - | `[{"ebkp_code": "...", "unit_cost": 450}]` |
| `/save-kennwerte` | POST | Kostenkennwerte speichern | `{"project_name": "...", "kennwerte": [...]}` | `{"success": true}` |
| `/reapply-costs` | POST | Kostenberechnung neu anstossen | `{"project_name": "..."}` | `{"success": true, "elements_processed": 1250}` |
| `/confirm-costs` | POST | Berechnete Kosten bestätigen und an Kafka senden | `{"project_name": "..."}` | `{"success": true}` |

**Sicherheitsfeatures:**
- Rate Limiting: 100 Anfragen/15 Min (allgemein), 20 für Schreiboperationen
- Input-Validierung: Alle Eingaben werden validiert
- Fehlerbehandlung: Strukturierte Fehlerantworten
- Timeout: 30 Sekunden Timeout für alle Anfragen

## Berechnungslogik

### eBKP-Matching-Algorithmus

```typescript
function matchEBKPCode(element: QTOElement, kennwerte: Kennwert[]): Kennwert | null {
  const elementCode = element.classification.id;
  
  // 1. Exakte Übereinstimmung
  let match = kennwerte.find(k => k.ebkp_code === elementCode);
  if (match) return match;
  
  // 2. Hierarchische Zuordnung (C2.01 → C2 → C)
  const hierarchyLevels = generateHierarchy(elementCode);
  for (const level of hierarchyLevels) {
    match = kennwerte.find(k => k.ebkp_code === level);
    if (match) return match;
  }
  
  return null; // Kein Match gefunden
}

function generateHierarchy(code: string): string[] {
  const parts = code.split('.');
  const levels: string[] = [];
  
  for (let i = parts.length - 1; i >= 0; i--) {
    levels.push(parts.slice(0, i + 1).join('.'));
  }
  
  return levels;
}
```

### Kostenberechnung

```typescript
function calculateCost(element: QTOElement, kennwert: Kennwert): CostElement {
  const quantity = element.quantity.value;
  const unitCost = kennwert.unit_cost;
  
  return {
    ...element,
    unit_cost: unitCost,
    total_cost: quantity * unitCost,
    currency: "CHF"
  };
}
```

## Kafka-Integration

Bei Bestätigung werden Daten an Kafka gesendet:

**Topic**: `cost-data`

**Nachrichten-Format:**

```json
{
  "project_id": "project_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "total_cost": 2450000.0,
    "cost_per_m2": 1225.0,
    "elements_count": 1250
  },
  "status": "confirmed"
}
```

## Installation

### Voraussetzungen

- Node.js 18.x
- MongoDB (verbunden mit QTO-Datenbank)
- Kafka (für Bestätigung)

### Lokale Entwicklung

#### Frontend (Vite + React/TypeScript)

```bash
# In das Plugin-Verzeichnis wechseln
cd plugin-cost

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Frontend läuft standardmässig unter `http://localhost:5173`.

#### Backend (Express + TypeScript)

```bash
cd plugin-cost/backend

# Abhängigkeiten installieren
npm install

# Backend-Server starten
npm run dev
```

Das Backend läuft unter dem Port aus `backend/config.ts` (Standard: `8004`).

### Docker Compose

```bash
# Im Root-Verzeichnis
docker-compose up --build -d
```

## Technologie-Stack

### Frontend

- **React**: 18.3
- **TypeScript**: 5.7
- **Vite**: 6.2
- **Weitere Abhängigkeiten**: Siehe `package.json`

### Backend

- **Node.js**: 18.x
- **Express**: Latest
- **TypeScript**: 5.7
- **MongoDB Driver**: Für Datenbankzugriff
- **Kafka Client**: Für Nachrichten-Publikation
- **Express Rate Limit**: Für Rate Limiting
- **Weitere Abhängigkeiten**: Siehe `backend/package.json`

## Konfiguration

### Backend-Konfiguration (`backend/config.ts`)

```typescript
export const config = {
  port: process.env.PORT || 8004,
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    qtoDatabase: "qto",
    costDatabase: "cost"
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || "localhost:9093",
    topic: "cost-data"
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 100, // Max Anfragen
    writeMax: 20 // Max Schreiboperationen
  }
};
```

### Umgebungsvariablen

```bash
PORT=8004
MONGODB_URI=mongodb://localhost:27017
KAFKA_BROKER=localhost:9093
```

## Sicherheitsfeatures

### Rate Limiting

- **Allgemein**: 100 Anfragen pro 15 Minuten
- **Schreiboperationen**: 20 Anfragen pro 15 Minuten

### Input-Validierung

- eBKP-Code-Format-Prüfung
- Kostenwert-Validierung (positive Zahlen)
- Projektname-Validierung

### Timeout-Handling

- 30 Sekunden Timeout für alle Anfragen
- Graceful Error-Handling

## Entwicklungshinweise

### QTO-Integration erweitern

Um zusätzliche QTO-Daten zu nutzen:

1. Erweitere Datenbankabfrage in Backend
2. Passe Datenmodell an
3. Aktualisiere Frontend-Anzeige

### Kafka-Integration anpassen

Um Nachrichtenformat zu ändern:

1. Ändere Nachrichten-Struktur in `confirm-costs` Handler
2. Aktualisiere Consumer (Dashboard)
3. Dokumentiere Änderungen

### Performance-Optimierung

Für grosse Projekte:

- Batch-Verarbeitung bei Kostenberechnung
- Indexierung von `qto_element_id` und `project_id`
- Caching von häufig abgefragten Kennwerten

</details>

