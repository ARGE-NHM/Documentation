---
title: Datenmodell
description: EAV-Datenmodell für flexible Eigenschaftsspeicherung
sidebar_position: 7
---

# Datenmodell

Das NHMzh Visualisierungs-System verwendet ein EAV-Datenmodell (Element-Attribute-Value) für flexible und erweiterbare Datenspeicherung.

## EAV-Konzept

**EAV (Element-Attribute-Value)** ist ein Datenmodellierungsansatz, der auch als "Long-Format-Daten" bezeichnet wird. Eigenschaften werden über mehrere Zeilen verteilt gespeichert, anstatt in separaten Spalten.

### Vorteile

- ✅ Neue Eigenschaften können ohne Schema-Änderung hinzugefügt werden
- ✅ Flexible Datenstruktur für verschiedene Elementtypen
- ✅ Skalierbar für unvorhersehbare Eigenschaftsanforderungen

### Nachteile

- ❌ Komplexere Abfragen (Pivot-Operationen erforderlich)
- ❌ Weniger intuitive SQL-Abfragen
- ❌ Potenzielle Performance-Implikationen

## Datenbank-Schema

### 1. Element-Daten (`element_data`)

Speichert alle Eigenschaften von Elementen mit 1:1-Beziehung.

```sql
CREATE TABLE element_data (
    project VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    id VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    param_name VARCHAR(255) NOT NULL,
    param_value TEXT,
    PRIMARY KEY (project, filename, id, timestamp, param_name)
);
```

**Beispiele:**

- Eine Wand befindet sich auf Ebene 1
- Eine Säule ist tragend
- Ein Element hat eine bestimmte Feuerwiderstandsklasse

**Eindeutige Identifikation:**

- **Element**: `project` + `filename` + `id` + `timestamp`
- **Eigenschaft**: `project` + `filename` + `id` + `timestamp` + `param_name`

### 2. Material-Layer-Daten (`material_data`)

Speichert Informationen über Material-Layer mit Many-to-1-Beziehung zu Elementen.

```sql
CREATE TABLE material_data (
    project VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    id VARCHAR(255) NOT NULL,
    sequence INT NOT NULL,
    timestamp DATETIME NOT NULL,
    param_name VARCHAR(255) NOT NULL,
    param_value TEXT,
    PRIMARY KEY (project, filename, id, sequence, timestamp, param_name)
);
```

**Layer-Konzept:**

- `sequence` repräsentiert die Schichtreihenfolge
- Nicht nur für mehrschichtige Elemente (Wände, Böden)
- Auch für Materialverwendung in Fenstern/Türen

**Eindeutige Identifikation:**

- **Material-Layer**: `project` + `filename` + `id` + `sequence` + `timestamp` + `param_name`

### 3. Update-Metadaten (`updates`)

Verfolgt individuelle Update-Ereignisse für neue IFC-Modelle.

```sql
CREATE TABLE updates (
    project VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    upload_id VARCHAR(255),
    status VARCHAR(50),
    PRIMARY KEY (project, filename, timestamp)
);
```

## Datenbeispiele

### Element-Daten (EAV-Format)

```sql
-- Wand-Element Eigenschaften
project    | filename | id      | timestamp           | param_name | param_value
-----------|----------|---------|---------------------|------------|------------
project1   | building1| wall_01 | 2024-01-15 10:30:00 | category   | Wall
project1   | building1| wall_01 | 2024-01-15 10:30:00 | level      | 1
project1   | building1| wall_01 | 2024-01-15 10:30:00 | loadbearing| true
project1   | building1| wall_01 | 2024-01-15 10:30:00 | firerating | R60
```

### Material-Layer-Daten (EAV-Format)

```sql
-- Wand-Material-Layer
project    | filename | id      | sequence | timestamp           | param_name | param_value
-----------|----------|---------|----------|---------------------|------------|------------
project1   | building1| wall_01 | 1        | 2024-01-15 10:30:00 | material   | Concrete
project1   | building1| wall_01 | 1        | 2024-01-15 10:30:00 | thickness  | 200mm
project1   | building1| wall_01 | 1        | 2024-01-15 10:30:00 | density    | 2400kg/m³
project1   | building1| wall_01 | 2        | 2024-01-15 10:30:00 | material   | Insulation
project1   | building1| wall_01 | 2        | 2024-01-15 10:30:00 | thickness  | 100mm
```

## PowerBI-Integration

### Pivot-Abfrage für Wide-Format

```sql
-- Element-Eigenschaften zu Wide-Format konvertieren
SELECT
    project,
    filename,
    id,
    timestamp,
    MAX(CASE WHEN param_name = 'category' THEN param_value END) AS category,
    MAX(CASE WHEN param_name = 'level' THEN param_value END) AS level,
    MAX(CASE WHEN param_name = 'loadbearing' THEN param_value END) AS loadbearing,
    MAX(CASE WHEN param_name = 'firerating' THEN param_value END) AS firerating
FROM element_data
WHERE project = 'project1'
GROUP BY project, filename, id, timestamp;
```

### Material-Layer mit Element-Eigenschaften

```sql
-- Material-Layer mit Element-Kontext
SELECT
    m.project,
    m.filename,
    m.id,
    m.sequence,
    m.timestamp,
    MAX(CASE WHEN m.param_name = 'material' THEN m.param_value END) AS material,
    MAX(CASE WHEN m.param_name = 'thickness' THEN m.param_value END) AS thickness,
    MAX(CASE WHEN e.param_name = 'category' THEN e.param_value END) AS element_category,
    MAX(CASE WHEN e.param_name = 'level' THEN e.param_value END) AS element_level
FROM material_data m
LEFT JOIN element_data e ON (
    m.project = e.project AND
    m.filename = e.filename AND
    m.id = e.id AND
    m.timestamp = e.timestamp
)
WHERE m.project = 'project1'
GROUP BY m.project, m.filename, m.id, m.sequence, m.timestamp;
```

## Datenintegrität

### Constraints

- **Primärschlüssel**: Verhindern Duplikate
- **Fremdschlüssel**: Referentielle Integrität zwischen Tabellen
- **Check-Constraints**: Validierung von Werten

### Indizierung

```sql
-- Performance-Optimierung
CREATE INDEX idx_element_data_lookup ON element_data(project, filename, id, timestamp);
CREATE INDEX idx_material_data_lookup ON material_data(project, filename, id, sequence, timestamp);
CREATE INDEX idx_updates_timestamp ON updates(timestamp DESC);
```

## Erweiterbarkeit

### Neue Eigenschaften hinzufügen

```sql
-- Keine Schema-Änderung erforderlich!
-- Neue Eigenschaften werden automatisch über param_name gespeichert
INSERT INTO element_data VALUES (
    'project1', 'building1', 'wall_01', '2024-01-15 10:30:00',
    'thermal_conductivity', '0.5 W/mK'
);
```

### Versionierung

- **Timestamp-basiert**: Jede IFC-Upload erstellt neue Datensätze
- **Historische Nachverfolgung**: Alle Versionen bleiben erhalten

## Neue IFC-Eigenschaften hinzufügen

Neue IFC-Eigenschaften können über die `IFC_PROPERTIES_TO_INCLUDE` Environment Variable des viz_ifc service konfiguriert werden. Siehe [Service-Details](./services.md#konfiguration) für weitere Informationen.
