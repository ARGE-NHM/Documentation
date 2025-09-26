---
title: NHMzh Systemarchitektur
description: Übersicht der Architektur und Berechnungslogik des Nachhaltigkeitsmonitorings
---

# Nachhaltigkeitsmonitoring der Stadt Zürich (NHMzh)
## Systemarchitektur und Berechnungslogik

### Management Summary

Das Nachhaltigkeitsmonitoring der Stadt Zürich (NHMzh) ist ein integriertes System zur automatisierten Bewertung der Nachhaltigkeit von Bauprojekten anhand von IFC (Industry Foundation Classes). Das System kombiniert Building Information Modeling (BIM) mit Kostenschätzung und Ökobilanzierung der Erstellung (LCA).

### 1. Systemarchitektur und Datenfluss

#### 1.1 Kommunikationsarchitektur

Das NHMzh-System basiert auf **direkten MongoDB-Datenbankabfragen** zwischen den Modulen:

- **Interne Kommunikation**: Direkte Datenbankabfragen zwischen Plugin-QTO, Plugin-Cost und Plugin-LCA
- **Externe Kommunikation**: Für die Anbindung an IFC Upload sowie die Übertragung von Endergebnissen an externe Dashboards wird Kafka verwendet
- **Datenbank**: MongoDB mit separaten Datenbanken für jedes Plugin (qto, cost, lca)

#### 1.2 Datenfluss-Übersicht

```
IFC-Modell → Kafka → Plugin-QTO (MongoDB) → Plugin-Cost (direkte DB-Abfrage) → Plugin-LCA (direkte DB-Abfrage) → Kafka → Dashboard
```

#### 1.3 Systemintegration

**Datenbankarchitektur:**
- Jedes Plugin verwendet eine eigene MongoDB-Datenbank
- Standardisierte Datenstrukturen für modulübergreifende Konsistenz
- Transaktionale Integrität durch direkte DB-Verbindungen

**Skalierbarkeit:**
- Horizontale Skalierung durch Docker-Container
- Asynchrone Verarbeitung grosser IFC-Dateien
- Parallele Berechnung von Kosten und Umweltauswirkungen

### 2. Plugin-QTO: Mengenermittlung und Datenextraktion

#### 2.1 IFC-Verarbeitungslogik

**IfcOpenShell-basierte Verarbeitung:**
- Unterstützung für IFC2X3 und IFC4-Schema
- Automatische Einheitenkonvertierung (m, m², m³)
- Speicher-optimierte Verarbeitung grosser Modelle

**Quantity Sets Priorität:**
1. Spezifische Quantity Sets (z.B. `Qto_WallBaseQuantities`)
2. Fallback auf `BaseQuantities`
3. Extraktion aus Properties bei fehlenden Quantity Sets

#### 2.2 Materialvolumen-Berechnungsalgorithmus

**Berechnungslogik:**
```javascript
// Vereinfachte Darstellung des Algorithmus
function calculateMaterialVolumes(element) {
  const totalVolume = element.NetVolume || element.GrossVolume;
  const materials = extractMaterials(element);
  
  return materials.map(material => ({
    name: material.name,
    volume: totalVolume * calculateMaterialFraction(material, element)
  }));
}

function calculateMaterialFraction(material, element) {
  // IfcMaterialConstituentSet: Explizite Fraction-Werte
  if (material.fraction) return material.fraction;
  
  // IfcMaterialLayerSet: Schichtdicken-basiert
  if (material.layerThickness && element.totalThickness) {
    return material.layerThickness / element.totalThickness;
  }
  
  // Gleichverteilung bei fehlenden Angaben
  return 1.0 / element.materials.length;
}
```

#### 2.3 Datenbank-Schema QTO

**MongoDB-Sammlung: `qto.elements`**
```json
{
  "_id": ObjectId,
  "globalId": "1a2b3c4d-...",
  "ifcType": "IfcWall",
  "name": "Aussenwand 470mm",
  "quantities": {
    "GrossSideArea": 125.5,
    "NetVolume": 45.2,
    "GrossVolume": 47.8
  },
  "materials": [
    {
      "name": "Gipskartonplatte",
      "volume": 2.18,
      "fraction": 0.045
    },
    {
      "name": "Holzfaserdämmung",
      "volume": 41.8,
      "fraction": 0.875
    }
  ],
  "properties": {
    "ebkp_code": "C2.01",
    "fire_rating": "REI 60"
  },
  "project_id": "project_001",
  "created_at": ISODate
}
```

### 3. Plugin-Cost: Kostenberechnung

#### 3.1 Berechnungslogik

**Grundformel:**
```
Elementkosten = Menge × Kennwert (CHF/Einheit)
```

**EBKP-Matching-Algorithmus:**
```javascript
function matchEBKPCode(element) {
  const elementCode = element.properties.ebkp_code;
  
  // 1. Exakte Übereinstimmung
  let match = findExactMatch(elementCode);
  if (match) return match;
  
  // 2. Hierarchische Zuordnung (C2.01 → C2 → C)
  const hierarchyLevels = generateHierarchy(elementCode);
  for (const level of hierarchyLevels) {
    match = findMatch(level);
    if (match) return match;
  }
```

#### 3.2 Datenbank-Schema Cost

**MongoDB-Sammlung: `cost.costElements`**
```json
{
  "_id": ObjectId,
  "element_id": ObjectId, // Referenz zu qto.elements
  "ebkp_code": "C2.01",
  "unit_cost": 450.0,
  "quantity": 125.5,
  "total_cost": 56475.0,
  "currency": "CHF",
  "calculation_method": "automatic",
  "confidence_level": 0.95,
  "project_id": "project_001",
  "calculated_at": ISODate
}
```

### 4. Plugin-LCA: Ökobilanzierung

#### 4.1 Umweltauswirkungen-Berechnungsalgorithmus

**Berechnungsformel:**
```
Umweltauswirkung = Materialvolumen (m³) × Dichte (kg/m³) × KBOB Ökoindikator
```

**Implementierung:**
```javascript
function calculateEnvironmentalImpact(materialInstance) {
  const kbobData = getKBOBData(materialInstance.name);
  if (!kbobData) return createZeroImpact();
  
  const mass = materialInstance.volume * kbobData.density;
  
  return {
    GWP: mass * kbobData.GWP_per_kg,
    UBP: mass * kbobData.UBP_per_kg,
    PENR: mass * kbobData.PENR_per_kg
  };
}
```

#### 4.2 Amortisationsberechnung

**EBKP-basierte Nutzungsdauer-Zuordnung:**
```javascript
function getAmortizationPeriod(ebkpCode) {
  const amortizationMap = {
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

#### 4.3 Relative Umweltauswirkungen

**Normalisierungsformel:**
```
Relative Umweltauswirkung = Absolute Umweltauswirkung / (Amortisationsdauer × Energiebezugsfläche)
```

**Einheiten:**
- GWP relativ: kg CO₂-eq/(m²·a)
- UBP relativ: UBP/(m²·a)
- PENR relativ: kWh/(m²·a)

#### 4.4 Datenbank-Schema LCA

**MongoDB-Sammlung: `lca.materialInstances`**
```json
{
  "_id": ObjectId,
  "element_id": ObjectId,
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
  "calculated_at": ISODate
}
```

### 5. Fehlerbehandlung und Datenqualität

#### 5.1 Automatisierte Validierung

**Plugin-QTO Validierung:**
```javascript
function validateQTOElement(element) {
  const errors = [];
  
  // Quantity Sets Validation
  if (!element.quantities || Object.keys(element.quantities).length === 0) {
    errors.push('MISSING_QUANTITIES');
  }
  
  // Volume Validation
  if (element.quantities.NetVolume > element.quantities.GrossVolume) {
    errors.push('INVALID_VOLUME_RATIO');
  }
  
  // Material Validation
  if (!element.materials || element.materials.length === 0) {
    errors.push('MISSING_MATERIALS');
  }
  
  return errors;
}
```

#### 5.2 Datenbereinigung

**Materialvolumen-Bereinigung:**
- Ungültige Anteile (< 0 oder > 1) werden normalisiert
- Fehlende Gesamtvolumen führen zu Warnung, aber nicht zu Fehler
- Materialien ohne Volumenangabe erhalten Volume = 0

**Kostenberechnung-Bereinigung:**
- Negative Kosten werden auf 0 gesetzt
- Fehlende Mengenangaben führen zu Übersprung des Elements
- Ungültige EBKP-Codes verwenden Fallback-Hierarchie

### 6. Integration und Schnittstellen

#### 7.1 Kafka-Integration

**Endergebnis-Übertragung:**
```json
{
  "project_id": "project_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "total_cost": 2450000.0,
    "cost_per_m2": 1225.0,
    "total_GWP": 850000.0,
    "GWP_per_m2_per_year": 7.08,
    "total_UBP": 25000000,
    "UBP_per_m2_per_year": 208.33
  },
  "details": {
    "elements_processed": 1250,
    "materials_identified": 85,
    "calculation_confidence": 0.94
  }
}
```

#### 7.2 API-Schnittstellen

**REST-Endpoints:**
- `GET /api/projects/{id}/qto` - Mengenermittlung
- `GET /api/projects/{id}/cost` - Kostenberechnung
- `GET /api/projects/{id}/lca` - Ökobilanz
- `POST /api/projects/{id}/recalculate` - Neuberechnung

