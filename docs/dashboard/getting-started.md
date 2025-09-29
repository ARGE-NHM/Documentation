---
title: PowerBI
description: PowerBI Dashboard Setup und Konfiguration
sidebar_position: 2
---

# Erste Schritte mit dem PowerBI Dashboard

Das NHMzh Dashboard ist ein PowerBI-basiertes System für die Visualisierung und Analyse von Nachhaltigkeitsdaten aus Bauprojekten. Diese Anleitung richtet sich an PowerBI-Benutzer, die das Dashboard konfigurieren und verwenden.

## Datenquellen einrichten

### Azure SQL Direct Query

Das Dashboard verbindet sich direkt mit der Azure SQL-Datenbank über Direct Query. Die Daten werden automatisch aktualisiert, aber ein manueller Refresh in PowerBI ist trotzdem erforderlich.

**Verbindungsdetails:**

- Server: `sql-nhmzh-vis-dev.database.windows.net`
- Datenbank: `sqldb-nhmzh-vis-dev`

### Verfügbare Abfragen

Das System stellt zwei Hauptabfragen bereit:

1. **Element- und Materialdaten** (`getData.txt`)

   - Hauptdatenquelle für alle PowerBI-Visuals
   - Kombiniert Element- und Materialeigenschaften aus EAV-Tabellen
   - Enthält Kosten, LCA-Werte, eBKP-Codes und 3D-Modell-IDs
   - Pivottiert EAV-Daten zu Wide-Format für PowerBI

2. **Update-Metadaten** (`getUpdates.txt`)

   - Zeigt alle verfügbaren Projekte und Dateien
   - Identifiziert neueste Versionen (`is_latest` Flag)
   - Enthält Blob-Storage-URLs für 3D-Viewer
   - Steuert welche 3D-Modelle verfügbar sind

## 3D-Viewer konfigurieren

### Custom Visual Installation

Das Dashboard verwendet ein spezielles Custom Visual für die 3D-Modellvisualisierung:

**Wichtige Konfigurationsparameter:**

- **Model Blob ID**: Eindeutige Kennung der Fragment-Datei
- **API Key**: Authentifizierung für den PowerBI-Server
- **Server URL**: Endpunkt des Fragment-Servers

### Viewer-Capabilities

Der 3D-Viewer unterstützt folgende Funktionen:

- **Interaktive 3D-Navigation**: Zoom, Pan, Rotate
- **Elementauswahl**: Klick auf 3D-Elemente für Detailinformationen
- **Drill-Down**: Verknüpfung mit anderen PowerBI-Visuals
- **Filtering**: Synchronisation mit PowerBI-Filtern
- **Highlighting**: Hervorhebung basierend auf PowerBI-Selektionen

## Datenmodell verstehen

### EAV-Struktur (Element-Attribute-Value)

Die Daten werden im EAV-Format gespeichert, was bedeutet:

- **Elemente**: Bauteile aus IFC-Dateien (Wände, Decken, etc.)
- **Attribute**: Eigenschaften (Material, Kosten, LCA-Werte)
- **Values**: Konkrete Werte für jedes Element-Attribut-Paar

## Nächste Schritte

- [Datenmodell](./data-model.md) - Detaillierte Erklärung der EAV-Struktur
