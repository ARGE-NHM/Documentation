---
title: NHMzh Ökobilanzierung
sidebar_label: Ökobilanzierung
description: LCA Modul im NHMzh Nachhaltigkeitsmonitoring
---

# NHMzh Ökobilanzierung (LCA)

**Umweltauswirkungen von Bauprojekten berechnen** – Automatische Ökobilanzierung nach SIA 2032/SIA 390/1 mit KBOB-Daten für Schweizer Baustandards.

## Was ist Ökobilanzierung?

Die Ökobilanzierung (Life Cycle Assessment, LCA) ist der dritte Schritt im NHMzh-Workflow. Sie:

- Berechnet Umweltauswirkungen basierend auf Materialvolumen
- Verwendet KBOB-Ökokennwerte für Schweizer Baustandards
- Berücksichtigt Amortisationsdauern für relative Bewertungen
- Visualisiert Ergebnisse für Nachhaltigkeitsanalysen

Die berechneten Umweltauswirkungen werden in der `lca`-Datenbank gespeichert und können für weitere Analysen verwendet werden.

## Methodik und Datenquellen

Die Ökobilanzierung folgt der Methodik gemäss **SIA 2032** und **SIA 390/1**. 

Alle Materialdaten stammen aus **KBOB Ökobilanzdaten im Baubereich**.

## Umweltindikatoren

Das System berechnet drei Umweltindikatoren:

| Indikator | Einheit (absolut) | Bedeutung |
|-----------|-------------------|-----------|
| **GWP** (Global Warming Potential) | kg CO₂-eq | Treibhausgasemissionen - Beitrag zum Klimawandel |
| **UBP** (Umweltbelastungspunkte) | UBP | Gesamtumweltbelastung - Ökobilanzbewertung nach der Methode der ökologischen Knappheit |
| **PENR** (Primärenergie nicht erneuerbar) | kWh | Verbrauch nicht erneuerbarer Energie - Endliche Ressourcen |

**Relative Werte:**
Die Indikatoren werden zusätzlich relativ berechnet (pro m² und Jahr), um verschiedene Projekte vergleichen zu können.

Siehe auch: [Berechnungslogik](../generelles/berechnungslogik#umweltauswirkungen-berechnung-lca)

## Workflow

### 1. Projektauswahl

Im Frontend wählen Sie ein bereits freigegebenes QTO-Projekt aus:

- Nur Projekte mit Status "freigegeben" sind verfügbar
- Projektliste zeigt Anzahl Elemente und Materialien
- Direkte Verknüpfung mit QTO-Daten (keine erneute Datenübertragung nötig)

### 2. Material-Mapping

Materialien aus IFC-Modellen müssen KBOB-Materialdaten zugeordnet werden:

**Automatisches Mapping:**
Das System versucht automatisch, IFC-Materialien KBOB-Materialien zuzuordnen basierend auf Materialnamen.

**Manuelles Mapping:**
Für nicht automatisch zugeordnete Materialien können Sie manuell eine Zuordnung vornehmen:

1. Material aus Liste auswählen
2. KBOB-Material aus Datenbank suchen
3. Zuordnung speichern
4. Zuordnung wird für alle Vorkommen dieses Materials verwendet

### 3. LCA-Berechnung

Nach dem Material-Mapping:

1. **Automatische Berechnung**: System berechnet Umweltauswirkungen für alle Materialien
2. **Berechnung pro Material**: `Volumen × Dichte × KBOB-Kennwert`
3. **Amortisationszuordnung**: Automatische Zuordnung basierend auf eBKP-Codes
4. **Relative Werte**: Berechnung relativer Umweltauswirkungen

### 4. Ergebnisvisualisierung

Die Ergebnisse werden in verschiedenen Ansichten dargestellt:

- **Material-Ansicht**: Umweltauswirkungen pro Material
- **Element-Ansicht**: Umweltauswirkungen pro Bauteil
- **Kategorie-Ansicht**: Gruppierung nach eBKP-Codes
- **Gesamtansicht**: Projekt-Gesamtwerte

### 5. Ergebnisprüfung und Bestätigung

Nach der Berechnung können Sie die Ergebnisse prüfen:

- Plausibilität der Einzelwerte
- Vollständigkeit der Materialzuordnungen
- Korrekte Amortisationszuordnung

Nach erfolgreicher Prüfung können Sie Ergebnisse bestätigen, die dann an Kafka gesendet werden.

## Funktionsumfang

### Material-Mapping

**Automatische Zuordnung:**
- Vergleich von IFC-Materialnamen mit KBOB-Datenbank
- Fuzzy-Matching für ähnliche Materialnamen
- Vorschläge für manuelle Zuordnung

**Manuelle Zuordnung:**
- Suche in KBOB-Datenbank
- Filterung nach Materialkategorien
- Zuordnung speichern und wiederverwenden

**Zuordnungsstatus:**
- ✅ Automatisch zugeordnet
- ⚠️ Manuell zugeordnet
- ❌ Nicht zugeordnet (Null-Werte)

### LCA-Berechnungen

Das System berechnet automatisch:

**Absolute Werte:**
- GWP absolut: kg CO₂-eq für gesamtes Material
- UBP absolut: UBP für gesamtes Material
- PENR absolut: kWh für gesamtes Material

**Relative Werte:**
- GWP relativ: kg CO₂-eq/(m²·a)
- UBP relativ: UBP/(m²·a)
- PENR relativ: kWh/(m²·a)

**Berechnungsformel:**
```
Umweltauswirkung = Materialvolumen (m³) × Dichte (kg/m³) × KBOB Ökoindikator
Relative Umweltauswirkung = Absolute Umweltauswirkung / (Amortisationsdauer × Energiebezugsfläche)
```

Siehe auch: [Berechnungslogik](../generelles/berechnungslogik#relative-umweltauswirkungen)

### Amortisationslogik

Die Amortisationsdauer wird automatisch basierend auf eBKP-Codes zugeordnet. Die Zuordnung erfolgt gemäss **SIA 2032, Anhang D**:

| Kategorie | eBKP-Codes | Amortisationsdauer |
|-----------|-----------|-------------------|
| **Tragkonstruktion** | C01, C02.01, C02.02, C03, C04.01, C04.04, C04.05, B06, B07, E01 | 60 Jahre |
| **Fassadenbekleidung** | C04.08, E02.03, E02.04, E02.05, F01.03 | 40 Jahre |
| **Ausbau und Technik** | D01-D08, E02.01, E02.02, E03, F01.02, F02, G01-G04 | 30 Jahre |
| **Spezielle Technik** | D05.02 | 20 Jahre |

**Fallback:** Wenn kein passender Code gefunden wird, wird standardmässig 30 Jahre verwendet.

Siehe auch: [Berechnungslogik](../generelles/berechnungslogik#amortisationsberechnung)

### KBOB-Integration

Das System nutzt die **KBOB Ökobilanzdaten im Baubereich** für Ökokennwerte:

- Schweizer Baustandards
- Aktualisierte Ökokennwerte
- Breite Materialabdeckung

Alle Materialdaten stammen aus dieser Datenbank.

## Material-Mapping durchführen

### Automatische Zuordnung prüfen

Das System zeigt den Status aller Materialien:

1. Projekt auswählen
2. Material-Übersicht öffnen
3. Status prüfen (automatisch zugeordnet / nicht zugeordnet)
4. Nicht zugeordnete Materialien identifizieren

### Manuelle Zuordnung

Für nicht automatisch zugeordnete Materialien:

1. **Material auswählen**: Nicht zugeordnetes Material aus Liste wählen
2. **KBOB-Material suchen**: Suche in KBOB-Datenbank starten
3. **Zuordnung wählen**: Passendes KBOB-Material auswählen
4. **Speichern**: Zuordnung speichern
5. **Verwendung**: Zuordnung wird für alle Vorkommen dieses Materials verwendet

**Suchtipps:**
- Verwenden Sie spezifische Materialbezeichnungen
- Suchen Sie nach Materialkategorien (z.B. "Beton", "Dämmung")
- Nutzen Sie Filter nach Materialtypen

### Zuordnungen bearbeiten

Sie können vorhandene Zuordnungen jederzeit ändern:

1. Material mit Zuordnung auswählen
2. "Zuordnung bearbeiten" wählen
3. Neue KBOB-Zuordnung auswählen
4. Speichern
5. **Wichtig**: Änderungen erfordern Neuberechnung der LCA-Werte

## LCA-Berechnung verstehen

### Absolute Werte

**Bedeutung:**
Absolute Werte zeigen die gesamten Umweltauswirkungen des Materials über seinen gesamten Lebenszyklus.

**Beispiel:**
- Material: Beton C30/37
- Volumen: 45.2 m³
- GWP absolut: 32,544 kg CO₂-eq

Dies bedeutet, dass dieser Beton während seiner gesamten Lebensdauer 32,544 kg CO₂-Äquivalente emittiert.

### Relative Werte

**Bedeutung:**
Relative Werte normalisieren die Umweltauswirkungen auf die Amortisationsdauer und die Energiebezugsfläche, um verschiedene Projekte vergleichen zu können.

**Beispiel:**
- GWP absolut: 32,544 kg CO₂-eq
- Amortisationsdauer: 60 Jahre
- Energiebezugsfläche: 500 m²
- GWP relativ: 1.085 kg CO₂-eq/(m²·a)

Dies bedeutet, dass dieser Bauteil pro Quadratmeter Energiebezugsfläche und Jahr 1.085 kg CO₂-Äquivalente emittiert.

**Vorteile:**
- Vergleichbarkeit verschiedener Projekte
- Bewertung der Nachhaltigkeit pro Flächeneinheit
- Normierung auf Nutzungsdauer

### Amortisationsdauer

Die Amortisationsdauer bestimmt, über welchen Zeitraum die Umweltauswirkungen verteilt werden:

- **Längere Amortisation** (z.B. 60 Jahre): Niedrigere relative Werte, da über längeren Zeitraum verteilt
- **Kürzere Amortisation** (z.B. 30 Jahre): Höhere relative Werte, da über kürzeren Zeitraum verteilt

**Beispiel:**
- Gleiche absolute GWP: 10,000 kg CO₂-eq
- Energiebezugsfläche: 500 m²
- Mit 60 Jahren Amortisation: 10,000 / (60 × 500) = 0.333 kg CO₂-eq/(m²·a)
- Mit 30 Jahren Amortisation: 10,000 / (30 × 500) = 0.667 kg CO₂-eq/(m²·a)

## Ergebnisinterpretation

### Material-Ansicht

Zeigt Umweltauswirkungen pro Material:

- Materialname
- Volumen
- Absolute Werte (GWP, UBP, PENR)
- Relative Werte (pro m²·a)
- Anzahl Vorkommen

**Verwendung:**
- Identifikation von Materialien mit hohen Umweltauswirkungen
- Vergleich verschiedener Materialien
- Optimierungspotenziale erkennen

### Element-Ansicht

Zeigt Umweltauswirkungen pro Bauteil:

- Elementname und IFC-Klasse
- eBKP-Klassifizierung
- Materialien im Element
- Gesamt-Umweltauswirkungen des Elements

**Verwendung:**
- Identifikation von Bauteilen mit hohen Umweltauswirkungen
- Vergleich verschiedener Konstruktionen
- Optimierungspotenziale auf Bauteilebene

### Kategorie-Ansicht

Gruppiert Umweltauswirkungen nach eBKP-Kategorien:

- Hierarchische Gruppierung nach eBKP-Struktur
- Summen pro Kategorie
- Anteil an Gesamt-Umweltauswirkungen

**Verwendung:**
- Identifikation von Kategorien mit hohen Umweltauswirkungen
- Vergleich verschiedener Gebäudeteile
- Priorisierung von Optimierungsmassnahmen

### Gesamtansicht

Zeigt Projekt-Gesamtwerte:

- Gesamt-GWP, UBP, PENR (absolut)
- Durchschnittliche relative Werte
- Vergleich mit Benchmarks (falls verfügbar)

**Verwendung:**
- Projektbewertung
- Vergleich mit anderen Projekten
- Nachhaltigkeitsbewertung

## Häufige Aufgaben

### Material-Mapping für neues Projekt

**Workflow:**
1. Projekt auswählen
2. Material-Übersicht öffnen
3. Automatisch zugeordnete Materialien prüfen
4. Nicht zugeordnete Materialien identifizieren
5. Manuelle Zuordnung durchführen
6. Vollständigkeit prüfen (alle Materialien zugeordnet?)
7. LCA-Berechnung durchführen

### LCA-Ergebnisse prüfen

**Prüfschritte:**
1. Gesamtwerte auf Plausibilität prüfen
2. Einzelne Materialien mit ungewöhnlich hohen Werten prüfen
3. Fehlende Materialzuordnungen identifizieren
4. Amortisationszuordnung korrekt?
5. Relative Werte plausibel?

### Ergebnisse bestätigen

Nach erfolgreicher Prüfung:

1. "Ergebnisse bestätigen" Button klicken
2. Bestätigung bestätigen
3. Ergebnisse werden an Kafka gesendet
4. Status ändert sich zu "bestätigt"
5. Daten sind für Dashboard verfügbar

## Best Practices

### Material-Mapping

- **Vollständigkeit**: Stellen Sie sicher, dass alle Materialien zugeordnet sind
- **Genauigkeit**: Verwenden Sie spezifische KBOB-Materialien (nicht generische)
- **Konsistenz**: Verwenden Sie einheitliche Zuordnungen pro Materialtyp
- **Dokumentation**: Dokumentieren Sie Zuordnungsentscheidungen

### Ergebnisinterpretation

- **Kontext**: Berücksichtigen Sie Projektkontext bei Interpretation
- **Vergleich**: Nutzen Sie relative Werte für Projektvergleiche
- **Priorisierung**: Fokussieren Sie auf Materialien mit hohen Umweltauswirkungen
- **Plausibilität**: Prüfen Sie Ergebnisse auf Sinnhaftigkeit

### Workflow

- **Iterativ**: Schrittweise Verfeinerung der Materialzuordnungen
- **Validierung**: Regelmässige Prüfung der Berechnungsergebnisse
- **Dokumentation**: Nachvollziehbarkeit aller Zuordnungen

## Nächste Schritte

Nach erfolgreicher Ökobilanzierung können Sie:

1. **Dashboard**: Ergebnisse im Dashboard visualisieren
2. **Kostenberechnung**: Kosten und Umweltauswirkungen kombinieren analysieren

Die Ökobilanzierung läuft parallel zur Kostenberechnung und beide nutzen die gleichen QTO-Daten.

---

<details>
<summary><strong>Entwickler: Architektur & Technische Details</strong></summary>

## Architektur und Kontext

Dieses Plugin ist die Weboberfläche für das LCA-Modul und ist Teil des NHMzh-Ökosystems. Die Architektur basiert auf einem dedizierten Backend für die Berechnungen.

### Frontend

- **Technologie**: React 18.3 / TypeScript 5.7
- **Build-Tool**: Vite 5.0
- **Zweck**: Visualisierung von LCA-Daten, Material-Mappings, Bestätigungen

**Hauptfunktionen:**
- Projektauswahl
- Material-Mapping-Interface
- LCA-Ergebnisvisualisierung
- Bestätigung von Ergebnissen

### Backend

- **Technologie**: Node.js 18.x / Express / TypeScript
- **Zweck**: Berechnungslogik, KBOB-Integration, Kafka-Publikation

**Hauptfunktionen:**
- Direkte QTO-Datenbankabfragen
- Material-Mapping-Verwaltung
- LCA-Berechnung (GWP, UBP, PENR)
- Amortisationszuordnung basierend auf eBKP-Codes
- MongoDB-Persistierung
- Kafka-Publikation bei Bestätigung

### Datenfluss

1. Das **LCA-Backend** fragt die `elements`-Sammlung aus der **MongoDB-Datenbank des QTO-Plugins** ab
2. Es berechnet die Umweltauswirkungen (GWP, UBP, PENR) basierend auf Materialvolumen und KBOB-Ökokennwerten
3. Die Ergebnisse werden in der eigenen `lca`-MongoDB-Datenbank gespeichert
4. Das **LCA-Frontend** ruft die berechneten Daten über eine **REST-API** vom LCA-Backend ab
5. Bei Bestätigung werden Daten an Kafka gesendet

Die Kommunikation zwischen Frontend und Backend erfolgt zustandslos über HTTP-Anfragen.

## Datenbank-Schema

### MongoDB-Datenbank: `lca`

### Sammlung: `materialInstances`

Die zentrale Sammlung, die Materialinstanzen mit berechneten Umweltauswirkungen enthält.

**Beispiel-Dokument:**

```json
{
  "_id": ObjectId("..."),
  "element_id": ObjectId("..."),
  "material_name": "Beton C30/37",
  "volume": 45.2,
  "density": 2400,
  "mass": 108480,
  "environmental_impact": {
    "GWP_absolute": 32544.0,
    "UBP_absolute": 1084800,
    "PENR_absolute": 54240.0,
    "GWP_relative": 10.85,
    "UBP_relative": 361.6,
    "PENR_relative": 18.08
  },
  "amortization_period": 60,
  "ebkp_code": "C2.01",
  "project_id": "project_001",
  "calculated_at": ISODate("2024-01-15T10:30:00Z")
}
```

**Felder:**
- `_id`: Eindeutige MongoDB-ID
- `element_id`: Referenz zum zugehörigen Element in `qto.elements`
- `material_name`: Materialname aus IFC
- `volume`: Materialvolumen in m³
- `density`: Dichte in kg/m³ (aus KBOB)
- `mass`: Berechnete Masse in kg (volume × density)
- `environmental_impact`: Berechnete Umweltauswirkungen
  - `GWP_absolute`: kg CO₂-eq (absolut)
  - `UBP_absolute`: UBP (absolut)
  - `PENR_absolute`: kWh (absolut)
  - `GWP_relative`: kg CO₂-eq/(m²·a)
  - `UBP_relative`: UBP/(m²·a)
  - `PENR_relative`: kWh/(m²·a)
- `amortization_period`: Amortisationsdauer in Jahren
- `ebkp_code`: eBKP-Code für Amortisationszuordnung
- `project_id`: Projekt-Identifikation
- `calculated_at`: Zeitstempel der Berechnung

### Sammlung: `materialMappings`

Speichert Zuordnungen zwischen IFC-Materialien und KBOB-Materialien.

**Beispiel-Dokument:**

```json
{
  "_id": ObjectId("..."),
  "project_id": ObjectId("..."),
  "ifc_material_name": "Beton C30/37",
  "kbob_material_id": "kbob_12345",
  "kbob_material_name": "Beton C30/37",
  "mapping_type": "automatic",
  "created_at": ISODate("2024-01-15T10:30:00Z")
}
```

## Berechnungslogik

### Umweltauswirkungen-Berechnungsalgorithmus

**Berechnungsformel:**
```
Umweltauswirkung = Materialvolumen (m³) × Dichte (kg/m³) × KBOB Ökoindikator
```

**Implementierung:**

```typescript
function calculateEnvironmentalImpact(
  materialInstance: MaterialInstance,
  kbobData: KBOBData
): EnvironmentalImpact {
  if (!kbobData) {
    return createZeroImpact();
  }
  
  const mass = materialInstance.volume * kbobData.density;
  
  return {
    GWP_absolute: mass * kbobData.GWP_per_kg,
    UBP_absolute: mass * kbobData.UBP_per_kg,
    PENR_absolute: mass * kbobData.PENR_per_kg
  };
}
```

### Amortisationsberechnung

**eBKP-basierte Nutzungsdauer-Zuordnung:**

Die Zuordnung erfolgt gemäss **SIA 2032, Anhang D**:

```typescript
function getAmortizationPeriod(ebkpCode: string): number {
  const amortizationMap: Record<string, number> = {
    // 60 Jahre: Tragkonstruktion
    'C01': 60, 'C02.01': 60, 'C02.02': 60, 'C03': 60, 'C04.01': 60,
    'C04.04': 60, 'C04.05': 60, 'B06': 60, 'B07': 60, 'E01': 60,
    
    // 40 Jahre: Fassadenbekleidung
    'C04.08': 40, 'E02.03': 40, 'E02.04': 40, 'E02.05': 40, 'F01.03': 40,
    
    // 30 Jahre: Ausbau und Technik
    'D01': 30, 'D02': 30, 'D03': 30, 'D04': 30, 'D05': 30, 'D06': 30,
    'D07': 30, 'D08': 30, 'E02.01': 30, 'E02.02': 30, 'E03': 30,
    'F01.02': 30, 'F02': 30, 'G01': 30, 'G02': 30, 'G03': 30, 'G04': 30,
    
    // 20 Jahre: Spezielle Technik
    'D05.02': 20
  };
  
  return findBestMatch(ebkpCode, amortizationMap) || 30; // Default: 30 Jahre
}
```

### Relative Umweltauswirkungen

**Normalisierungsformel:**
```
Relative Umweltauswirkung = Absolute Umweltauswirkung / (Amortisationsdauer × Energiebezugsfläche)
```

**Einheiten:**
- GWP relativ: kg CO₂-eq/(m²·a)
- UBP relativ: UBP/(m²·a)
- PENR relativ: kWh/(m²·a)

**Implementierung:**

```typescript
function calculateRelativeImpact(
  absoluteImpact: EnvironmentalImpact,
  amortizationPeriod: number,
  energyReferenceArea: number
): EnvironmentalImpact {
  const normalizationFactor = amortizationPeriod * energyReferenceArea;
  
  return {
    GWP_relative: absoluteImpact.GWP_absolute / normalizationFactor,
    UBP_relative: absoluteImpact.UBP_absolute / normalizationFactor,
    PENR_relative: absoluteImpact.PENR_absolute / normalizationFactor
  };
}
```

## KBOB-Integration

Das System nutzt die **KBOB Ökobilanzdaten im Baubereich** für Ökokennwerte. Alle Materialdaten stammen aus dieser Datenbank.

**KBOB-Datenstruktur:**

```typescript
interface KBOBData {
  id: string;
  name: string;
  category: string;
  density: number; // kg/m³
  GWP_per_kg: number; // kg CO₂-eq/kg
  UBP_per_kg: number; // UBP/kg
  PENR_per_kg: number; // kWh/kg
}
```

**Material-Matching:**

```typescript
function matchMaterialToKBOB(ifcMaterialName: string): KBOBData | null {
  // 1. Exakte Übereinstimmung
  let match = kbobDatabase.findByName(ifcMaterialName);
  if (match) return match;
  
  // 2. Fuzzy-Matching
  match = kbobDatabase.fuzzyMatch(ifcMaterialName);
  if (match) return match;
  
  return null; // Kein Match gefunden
}
```

## API-Endpunkte

Das Backend stellt folgende REST-Endpunkte bereit:

| Endpunkt | Methode | Beschreibung | Request Body | Response |
|----------|---------|--------------|--------------|----------|
| `/health` | GET | Health Check | - | `{"status": "ok"}` |
| `/projects` | GET | Liste aller Projekte | - | `[{"id": "...", "name": "..."}]` |
| `/projects/:projectName/materials` | GET | Materialien eines Projekts | - | `[{"name": "...", "mapping": {...}}]` |
| `/projects/:projectName/materials/:materialName/mapping` | PUT | Material-Mapping speichern | `{"kbob_id": "..."}` | `{"success": true}` |
| `/projects/:projectName/calculate` | POST | LCA-Berechnung anstossen | - | `{"success": true, "materials_processed": 85}` |
| `/projects/:projectName/results` | GET | LCA-Ergebnisse abrufen | - | `[{"material_name": "...", "environmental_impact": {...}}]` |
| `/projects/:projectName/confirm` | POST | Ergebnisse bestätigen | - | `{"success": true}` |

## Installation

### Voraussetzungen

- Node.js 18.x
- MongoDB (verbunden mit QTO-Datenbank)
- KBOB-Datenbank-Zugriff
- Kafka (für Bestätigung)

### Lokale Entwicklung

#### Frontend (Vite + React/TypeScript)

```bash
# In das Plugin-Verzeichnis wechseln
cd plugin-lca

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Frontend läuft standardmässig unter `http://localhost:5173`.

#### Backend (Express + TypeScript)

```bash
cd plugin-lca/backend

# Abhängigkeiten installieren
npm install

# Backend-Server starten
npm run dev
```

Das Backend läuft unter dem Port aus `backend/config.ts` (Standard: `8002`).

### Docker Compose

```bash
# Im Root-Verzeichnis
docker-compose up --build -d
```

## Technologie-Stack

### Frontend

- **React**: 18.3
- **TypeScript**: 5.7
- **Vite**: 5.0
- **Weitere Abhängigkeiten**: Siehe `package.json`

### Backend

- **Node.js**: 18.x
- **Express**: Latest
- **TypeScript**: 5.7
- **MongoDB Driver**: Für Datenbankzugriff
- **Kafka Client**: Für Nachrichten-Publikation
- **KBOB Client**: Für Ökokennwert-Zugriff
- **Weitere Abhängigkeiten**: Siehe `backend/package.json`

## Konfiguration

### Backend-Konfiguration (`backend/config.ts`)

```typescript
export const config = {
  port: process.env.PORT || 8002,
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    qtoDatabase: "qto",
    lcaDatabase: "lca"
  },
  kbob: {
    apiUrl: process.env.KBOB_API_URL || "https://kbob-api.example.com",
    apiKey: process.env.KBOB_API_KEY
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || "localhost:9093",
    topic: "lca-data"
  }
};
```

### Umgebungsvariablen

**Frontend (`.env`):**
```bash
VITE_API_URL=http://localhost:8002
```

**Backend (`.env`):**
```bash
PORT=8002
MONGODB_URI=mongodb://localhost:27017
KBOB_API_URL=https://kbob-api.example.com
KBOB_API_KEY=your-api-key
KAFKA_BROKER=localhost:9093
ENERGY_REFERENCE_AREA=500
```

## Kafka-Integration

Bei Bestätigung werden Daten an Kafka gesendet:

**Topic**: `lca-data`

**Nachrichten-Format:**

```json
{
  "project_id": "project_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "total_GWP": 850000.0,
    "GWP_per_m2_per_year": 7.08,
    "total_UBP": 25000000,
    "UBP_per_m2_per_year": 208.33,
    "total_PENR": 125000,
    "PENR_per_m2_per_year": 1.04
  },
  "status": "confirmed"
}
```

## Entwicklungshinweise

### KBOB-Integration erweitern

Um zusätzliche KBOB-Daten zu nutzen:

1. Erweitere KBOB-Client-Interface
2. Passe Berechnungslogik an
3. Aktualisiere Datenbank-Schema

### Amortisationslogik anpassen

Um neue eBKP-Codes zu unterstützen:

1. Erweitere `amortizationMap` in `getAmortizationPeriod`
2. Dokumentiere Zuordnung
3. Teste mit verschiedenen eBKP-Codes

### Performance-Optimierung

Für grosse Projekte:

- Batch-Verarbeitung bei LCA-Berechnung
- Caching von KBOB-Daten
- Indexierung von `element_id` und `project_id`

### Material-Mapping verbessern

Für bessere automatische Zuordnungen:

1. Verbessere Fuzzy-Matching-Algorithmus
2. Erweitere Synonyme-Datenbank
3. ML für Zuordnungen

</details>

