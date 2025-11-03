---
title: NHMzh Mengenermittlung
sidebar_label: Mengenermittlung
description: Mengenermittlung im NHMzh Nachhaltigkeitsmonitoring der Stadt Zürich
---

# NHMzh Mengenermittlung (QTO)

**Automatische Extraktion von Mengen, Materialien und Eigenschaften aus IFC-Modellen** – Der erste Schritt der Analyse im NHMzh-Workflow für präzise Kosten- und Umweltauswirkungsberechnungen.

## Was ist QTO?

Die Mengenermittlung (Quantity Take-Off, QTO) ist der erste Schritt der Analyse im NHMzh-Workflow. Sie:

- Extrahiert automatisch Bauteile aus IFC-Modellen
- Berechnet Mengen (Flächen, Längen, Volumen)
- Identifiziert Materialien und deren Volumenanteile
- Erkennt eBKP-Klassifizierungen
- Ermöglicht manuelle Nachbearbeitung der Daten

Die extrahierten Daten dienen als Grundlage für die nachgelagerten Module (Kostenberechnung und Ökobilanzierung).

## Workflow

### 1. IFC-Upload und Verarbeitung

IFC-Dateien werden über den **IFC Uploader Plugin** (entwickelt von Infrastructure & Core Team) hochgeladen:

1. **Upload**: IFC-Datei wird über das IFC Uploader Plugin hochgeladen und in MinIO abgelegt
2. **Trigger**: Kafka-Nachricht löst Verarbeitung aus
3. **Verarbeitung**: QTO-Backend parst das IFC-Modell automatisch
4. **Speicherung**: Daten werden in der `qto`-Datenbank gespeichert

**Hinweis:** Der IFC-Upload wird durch das [Infrastructure & Core Team](../../infrastructure-team/overview) bereitgestellt (IFC Uploader Plugin). Das QTO-Plugin verarbeitet die hochgeladenen Dateien automatisch.

### 2. Projektauswahl

Im Frontend können Sie alle bereits verarbeiteten Projekte einsehen:

- Liste aller verfügbaren Projekte
- Projektstatus (in Bearbeitung, freigegeben)
- Anzahl extrahierter Elemente
- Letzte Aktualisierung

### 3. Datenvisualisierung

Das Frontend zeigt extrahierte Bauteile in einer anpassbaren Tabelle:

**Angezeigte Informationen:**
- Elementname und IFC-Klasse
- Mengen (Fläche, Länge oder Volumen)
- Materialien mit Volumenanteilen
- eBKP-Klassifizierung
- Geschoss/Level
- Eigenschaften aus IFC

**Filter- und Sortierfunktionen:**
- Nach IFC-Klasse filtern
- Nach eBKP-Code filtern
- Nach Geschoss filtern
- Mengen sortieren

## Funktionsumfang

### IFC-Parsing

Das System unterstützt:
- **IFC2x3** und **IFC4** Schemas
- **25 verschiedene IFC-Klassen** (Wände, Decken, Balken, etc.)
- Automatische Mengen-Extraktion aus Quantity Sets
- Material- und Schichtaufbau-Analyse

### Materialvolumen-Berechnung

Das System berechnet automatisch Materialvolumen aus Gesamtvolumen und Materialanteilen:

**Berechnungsmethoden:**
1. **Schichtdicken-basiert**: Anteil = Schichtdicke / Gesamtdicke
2. **Fraction-Werte**: Explizite Anteile aus IFC
3. **Gleichverteilung**: Fallback bei fehlenden Angaben

Siehe auch: [Berechnungslogik](../generelles/berechnungslogik#materialvolumen-berechnung-qto)

### eBKP-Klassifizierung

Das System erkennt automatisch eBKP-Codes aus IFC-Modellen. Die Erkennung erfolgt über:
- `IfcClassificationReference` (empfohlen)
- Property Sets mit eBKP-Code-Feldern

### Excel-Import

Sie können Elemente über Excel ergänzen oder korrigieren:

**Import-Funktionen:**
- Ergänzung von Elementen über GUID
- Übernahme von eBKP-Klassifikationen
- Korrektur von Mengenangaben
- Hinzufügen fehlender Elemente

**Excel-Format:**
- Spalte `GlobalId`: Eindeutige IFC-Kennung
- Spalte `eBKP_Code`: eBKP-Klassifizierung
- Weitere Spalten je nach Bedarf

### Manuelle Datenbearbeitung

Sie können Mengen und Attribute direkt im Frontend bearbeiten:

**Bearbeitbare Felder:**
- Mengenangaben (Werte korrigieren)
- eBKP-Codes (zuordnen oder ändern)
- Elementnamen
- Eigenschaften

**Manuelles Hinzufügen:**
- Neue Elemente für nicht-modellierte Bauteile
- Vervollständigung unvollständiger Daten

### Excel-Export

Sie können alle oder gefilterte Daten als Excel-Datei exportieren:

- Vollständige Elementliste mit allen Eigenschaften
- Gefilterte Ansichten exportieren
- Formatierung für weitere Bearbeitung

## Datenvalidierung

Das System führt automatische Qualitätsprüfungen durch:

### Automatische Validierung

- **Mengenangaben**: Prüfung auf Vollständigkeit und Plausibilität
- **Volumenkonsistenz**: NetVolume ≤ GrossVolume
- **Materialinformationen**: Vorhandensein von Materialzuordnungen
- **eBKP-Zuordnung**: Erkennung fehlender Klassifizierungen

### Datenqualitäts-Indikatoren

Das Frontend zeigt Warnungen für:
- Fehlende Mengenangaben
- Fehlende Materialinformationen
- Fehlende eBKP-Klassifizierungen
- Unplausible Volumenverhältnisse

## Projektfreigabe

Nach Abschluss der Bearbeitung können Sie ein Projekt freigeben:

**Freigabe-Prozess:**
1. Datenprüfung und -korrektur
2. Vollständigkeitsprüfung (alle Elemente klassifiziert?)
3. Freigabe über Button im Frontend
4. Daten werden für nachgelagerte Module verfügbar

**Nach der Freigabe:**
- Daten können von Cost-Plugin gelesen werden
- Daten können von LCA-Plugin gelesen werden
- Projektstatus wechselt zu "freigegeben"

## Häufige Aufgaben

### Mengen korrigieren

Wenn Mengenangaben aus IFC fehlerhaft sind:

1. Element in Tabelle finden
2. Mengenwert direkt bearbeiten
3. Änderung speichern
4. Änderungen werden sofort übernommen

### eBKP-Codes nachträglich zuordnen

Für Elemente ohne eBKP-Klassifizierung:

1. Element auswählen
2. eBKP-Code eingeben oder aus Liste wählen
3. Speichern
4. Code wird für Kostenberechnung verwendet

### Fehlende Elemente ergänzen

Für nicht-modellierte Bauteile:

1. "Neues Element hinzufügen" auswählen
2. Elementtyp und Eigenschaften eingeben
3. Mengenangaben erfassen
4. eBKP-Code zuordnen
5. Speichern

### Excel-Daten importieren

Für Massenkorrekturen:

1. Daten als Excel vorbereiten (GUID, eBKP-Code, etc.)
2. Import-Funktion verwenden
3. Daten werden mit vorhandenen Elementen verknüpft
4. Konflikte werden angezeigt und können gelöst werden

## Best Practices

### IFC-Modellierung

Für optimale Ergebnisse sollten IFC-Modelle folgende Anforderungen erfüllen:

- Vollständige Quantity Sets für alle Bauteile
- Detaillierte Materialmodellierung (Schichtaufbauten)
- Korrekte eBKP-Klassifizierung

Siehe: [IFC-Modellierungsrichtlinien](../generelles/ifc-guidelines)

### Datenbearbeitung

- **Vor Freigabe**: Vollständige Prüfung aller Elemente
- **Konsistenz**: Einheitliche eBKP-Zuordnung pro Elementtyp
- **Dokumentation**: Vermerke zu manuellen Änderungen
- **Rückverfolgbarkeit**: Nachvollziehbarkeit aller Korrekturen

### Workflow-Optimierung

- **Iterative Bearbeitung**: Schrittweise Verbesserung der Datenqualität
- **Zwischenspeicherung**: Regelmässiges Speichern während Bearbeitung
- **Validierung**: Nutzung der automatischen Qualitätsprüfungen

## Nächste Schritte

Nach erfolgreicher Mengenermittlung können Sie:

1. **[Kostenberechnung](../cost/intro)**: Kostenkennwerte auf Mengen anwenden
2. **[Ökobilanzierung](../lca/intro)**: Umweltauswirkungen berechnen

Beide Module greifen direkt auf die QTO-Datenbank zu und benötigen keine zusätzliche Datenübertragung.

---

<details>
<summary><strong>Entwickler: Architektur & Technische Details</strong></summary>

## Architektur

Die NHMzh Mengenermittlung besteht aus einem Frontend und einem Backend:

### Frontend

- **Technologie**: React 18.3 / TypeScript 5.3
- **Build-Tool**: Vite 7.0
- **Zweck**: Visualisierung und Bearbeitung von extrahierten Bauteildaten

**Hauptfunktionen:**
- Projektauswahl und -verwaltung
- Tabellarische Datenvisualisierung
- Manuelle Datenbearbeitung
- Excel-Import/Export
- Projektfreigabe

### Backend

- **Technologie**: Python 3.8+ / FastAPI
- **IFC-Parsing**: IfcOpenShell
- **Zweck**: Verarbeitung von IFC-Modellen

**Hauptfunktionen:**
- IFC-Parsing und -Extraktion
- Mengenberechnung
- Materialvolumen-Berechnung
- eBKP-Klassifizierung
- Datenbank-Persistierung

## Datenfluss und Integration

### IFC-Verarbeitungs-Pipeline

1. **Upload**: IFC-Datei wird über das [IFC Uploader Plugin](../../infrastructure-team/overview) hochgeladen (bereitgestellt von Infrastructure & Core Team)
2. **Trigger**: Kafka-Nachricht über neue IFC-Datei in MinIO
3. **Download**: `qto_ifc-msg`-Service holt Datei aus MinIO
4. **Upload**: Weiterleitung an `/upload-ifc/`-Endpunkt
5. **Asynchrone Verarbeitung**: Hintergrundaufgabe parst IFC-Modell
6. **Speicherung**: Ergebnisse in `qto`-MongoDB-Datenbank

### Integration mit anderen Modulen

**Datenquelle für nachgelagerte Module:**
- **Cost-Plugin**: Liest `qto.elements` direkt aus MongoDB
- **LCA-Plugin**: Liest `qto.elements` direkt aus MongoDB

**Kommunikation:**
- Keine direkte Kafka-Publikation von Elementdaten
- Ausschliesslich MongoDB-Datenbankabfragen

## IFC-Verarbeitungslogik

### IfcOpenShell-basierte Verarbeitung

**Unterstützte Schemas:**
- IFC2X3
- IFC4

**Einheitenkonvertierung:**
- Automatische Konvertierung in Standard-Einheiten (m, m², m³)
- Behandlung unterschiedlicher IFC-Einheiten

**Speicher-Optimierung:**
- Streaming-Verarbeitung für grosse Modelle
- Batch-Verarbeitung von Elementen

### Quantity Sets Priorität

Das System extrahiert Mengen in folgender Priorität:

1. **Spezifische Quantity Sets** (z.B. `Qto_WallBaseQuantities`)
2. **Fallback auf `BaseQuantities`**
3. **Extraktion aus Properties** bei fehlenden Quantity Sets

### Materialvolumen-Berechnungsalgorithmus

**Berechnungslogik:**

```python
def calculate_material_volumes(element):
    total_volume = element.get('NetVolume') or element.get('GrossVolume')
    materials = extract_materials(element)
    
    return [
        {
            'name': material.name,
            'volume': total_volume * calculate_material_fraction(material, element)
        }
        for material in materials
    ]

def calculate_material_fraction(material, element):
    # IfcMaterialConstituentSet: Explizite Fraction-Werte
    if material.fraction:
        return material.fraction
    
    # IfcMaterialLayerSet: Schichtdicken-basiert
    if material.layer_thickness and element.total_thickness:
        return material.layer_thickness / element.total_thickness
    
    # Gleichverteilung bei fehlenden Angaben
    return 1.0 / len(element.materials)
```

## Datenbank-Schema

### MongoDB-Datenbank: `qto`

### Sammlung: `elements`

Jedes Dokument repräsentiert ein extrahiertes IFC-Bauteil.

**Beispiel-Dokument:**

```json
{
  "_id": ObjectId("..."),
  "project_id": ObjectId("..."),
  "global_id": "3DqaUydM99ehywE4_2hm1u",
  "ifc_class": "IfcWall",
  "name": "Aussenwand_470mm",
  "level": "U1.UG_RDOK",
  "quantity": {
    "value": 555,
    "type": "area",
    "unit": "m²"
  },
  "classification": {
    "id": "C2.01",
    "name": "Aussenwandkonstruktion",
    "system": "eBKP"
  },
  "materials": [
    {
      "name": "Holzfaserdämmung",
      "volume": 8.5,
      "fraction": 0.875,
      "unit": "m³"
    }
  ],
  "properties": {
    "Pset_WallCommon.IsExternal": "True"
  },
  "status": "active",
  "created_at": ISODate("2024-01-15T10:30:00Z")
}
```

**Felder:**
- `_id`: Eindeutige MongoDB-ID
- `project_id`: Referenz zum Projekt
- `global_id`: IFC GlobalId (eindeutige Identifikation)
- `ifc_class`: IFC-Klasse (z.B. "IfcWall")
- `name`: Elementname aus IFC
- `level`: Geschoss/Level-Information
- `quantity`: Mengenangabe (value, type, unit)
- `classification`: eBKP-Klassifizierung
- `materials`: Array von Materialien mit Volumenanteilen
- `properties`: Weitere IFC-Properties
- `status`: Elementstatus ("active", "deleted")
- `created_at`: Zeitstempel der Erstellung

## API-Endpunkte

### FastAPI-Endpunkte

| Endpunkt | Methode | Beschreibung | Request Body | Response |
|----------|---------|--------------|--------------|----------|
| `/upload-ifc/` | POST | Verarbeitet eine IFC-Datei (wird durch Infrastructure & Core Team via Kafka ausgelöst) | Multipart file | `{"job_id": "...", "status": "processing"}` |
| `/ifc-jobs/{job_id}` | GET | Ruft den Status eines Verarbeitungsjobs ab | - | `{"status": "completed", "elements_count": 1250}` |
| `/projects/` | GET | Listet alle verfügbaren Projekte auf | - | `[{"id": "...", "name": "...", "element_count": 1250}]` |
| `/projects/{name}/elements/` | GET | Ruft alle Elemente eines Projekts ab | - | `[{"_id": "...", ...}]` |
| `/projects/{name}/elements/{element_id}` | PUT | Aktualisiert ein Element | `{"quantity": {...}, ...}` | `{"success": true}` |
| `/projects/{name}/elements/` | POST | Erstellt ein neues Element | `{"name": "...", ...}` | `{"_id": "...", ...}` |
| `/projects/{name}/approve/` | POST | Schliesst die Bearbeitung eines Projekts ab | - | `{"status": "approved"}` |
| `/projects/{name}/export/` | GET | Exportiert Projektdaten als Excel | - | Excel file download |

**Query-Parameter:**

- `/projects/{name}/elements/`:
  - `filter`: Filter nach IFC-Klasse oder eBKP-Code
  - `limit`: Maximale Anzahl Elemente
  - `offset`: Pagination-Offset

## Installation

### Voraussetzungen

- Docker und Docker Compose
- Python 3.8+
- Node.js 18+

### Lokale Entwicklung

#### Frontend (Vite + React/TypeScript)

```bash
# In das Plugin-Verzeichnis wechseln
cd plugin-qto

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Frontend läuft standardmässig unter `http://localhost:5173`.

#### Backend (Python/FastAPI)

```bash
# In Backend-Verzeichnis wechseln
cd plugin-qto/backend

# Virtuelle Umgebung erstellen und aktivieren
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# Backend-Server starten
uvicorn main:app --reload --port 8001
```

### Docker Compose

```bash
# Im Root-Verzeichnis
docker-compose up --build -d
```

## Technologie-Stack

### Frontend

- **React**: 18.3
- **TypeScript**: 5.3
- **Vite**: 7.0
- **Weitere Abhängigkeiten**: Siehe `package.json`

### Backend

- **Python**: 3.8+
- **FastAPI**: Latest
- **IfcOpenShell**: Für IFC-Parsing
- **PyMongo**: MongoDB-Client
- **Weitere Abhängigkeiten**: Siehe `requirements.txt`

## Validierung und Fehlerbehandlung

### Automatische Validierung

**QTO-Validierung:**

```python
def validate_qto_element(element):
    errors = []
    
    # Quantity Sets Validation
    if not element.get('quantity') or not element['quantity'].get('value'):
        errors.append('MISSING_QUANTITIES')
    
    # Volume Validation
    if element.get('NetVolume') and element.get('GrossVolume'):
        if element['NetVolume'] > element['GrossVolume']:
            errors.append('INVALID_VOLUME_RATIO')
    
    # Material Validation
    if not element.get('materials') or len(element['materials']) == 0:
        errors.append('MISSING_MATERIALS')
    
    return errors
```

### Datenbereinigung

**Materialvolumen-Bereinigung:**
- Ungültige Anteile (< 0 oder > 1) werden normalisiert
- Fehlende Gesamtvolumen führen zu Warnung, aber nicht zu Fehler
- Materialien ohne Volumenangabe erhalten Volume = 0

## Entwicklungshinweise

### IFC-Parsing erweitern

Um neue IFC-Klassen zu unterstützen:

1. Erweitere `ifc_processing_service.py`
2. Implementiere spezifische Extraktionslogik
3. Füge Tests hinzu
4. Dokumentiere in [IFC-Modellierungsrichtlinien](../generelles/ifc-guidelines)

### Datenbank-Migrationen

Bei Schema-Änderungen:

1. Erstelle Migrations-Skript
2. Backup vor Migration
3. Teste Migration auf Test-Datenbank
4. Dokumentiere Änderungen

### Performance-Optimierung

Für grosse IFC-Modelle:

- Streaming-Verarbeitung verwenden
- Batch-Inserts in MongoDB
- Indexierung von häufig abgefragten Feldern

</details>

