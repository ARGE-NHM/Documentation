---
title: Generelles
description: Dashboard im NHMzh Nachhaltigkeitsmonitoring
sidebar_position: 1
---

# NHMzh Dashboard Übersicht

Das NHMzh Dashboard ist das zentrale Visualisierungs- und Berichtstool für das Nachhaltigkeitsmonitoring von Bauprojekten. Es integriert 3D-Modellvisualisierung mit LCA- und Kostendaten für umfassende Nachhaltigkeitsanalysen.

## Kernfunktionen

### 📊 PowerBI-Plattform

Das Reporting erfolgt in PowerBI, wo Benutzer eigene Berichte und Dashboards erstellen können. Die Datenstruktur ist so konzipiert, dass sie flexibel für verschiedene Analysezwecke verwendet werden kann.

### 🏗️ 3D-Modellvisualisierung

- **IFC-zu-Fragment Konvertierung**: Schnelle WebGL-kompatible 3D-Darstellung direkt in PowerBI
- **Interaktive Elementauswahl**: Direkte Verknüpfung zwischen 3D-Modell und Datenanalyse
- **Drill-Down-Visualisierung**: Auswahl im Dashboard hebt korrespondierende Elemente in 3D hervor

### 📈 Datenmodell & Historische Nachverfolgung

- **EAV-Datenstruktur**: Flexible Speicherung von Element- und Materialeigenschaften
- **Aktuelle Daten**: Neueste Verarbeitungsergebnisse zur Darstellung des aktuellen Standes
- **Historische Daten**: Vollständige Nachverfolgung aller Berechnungsergebnisse über Zeit
- **Azure SQL Direct Query**: Soll Automatische Datenaktualisierung ermöglichen (manuelles refreshing in PowerBI leider trotzdem erforderlich)

## Backend-Services-Übersicht

| Service            | Zweck                          | Technologie        |
| ------------------ | ------------------------------ | ------------------ |
| **viz_ifc**        | IFC-Verarbeitung zu Fragmenten | Node.js/TypeScript |
| **viz_lca-cost**   | LCA/Kosten-Datenverarbeitung   | Go                 |
| **viz_pbi-server** | PowerBI-API-Backend            | Go                 |

## Dokumentation

### Für Anwender

Als Anwender werden in dieser Dokumentation Personen verstanden, die das PowerBI Dashboard pflegen und erweritern.

- [Erste Schritte](./getting-started.md) - Schnellstart und Überblick
- [Datenmodell](./data-model.md) - EAV-Datenstruktur

### Für Entwickler

Als Entwickler werden in dieser Dokumentation jene Personen verstaden, welche die Backend-Services pflegen und erweitern.

- [Setup & Entwicklungsumgebung](./setup.md) - Lokale Entwicklung
- [Service-Details](./services.md) - Technische Architektur
- [API-Referenz](./api-reference.md) - Endpunkt-Dokumentation
- [Testing & Integration](./testing.md) - Testumgebungen
