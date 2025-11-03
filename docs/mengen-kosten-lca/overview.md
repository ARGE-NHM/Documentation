---
title: Generelles
description: Überblick über die Plugins Kosten, LCA und Mengenermittlung
sidebar_position: 1
---

# NHMzh Mengen-, Kosten- und LCA-Plugins

Diese Plugin-Suite umfasst drei integrierte Module für das NHMzh Nachhaltigkeitsmonitoring der Stadt Zürich. Die Module arbeiten zusammen, um automatisiert Mengen aus BIM-Modellen zu extrahieren, Kosten zu berechnen und Umweltauswirkungen zu bewerten.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.8-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)

## Plugin-Übersicht

| Plugin | Zweck | Frontend | Backend | Datenbank |
|--------|-------|----------|---------|-----------|
| **NHMzh Mengenermittlung (QTO)** | Extraktion von Mengen, Materialien und Eigenschaften aus IFC-Modellen | React/TypeScript (Vite) | Python/FastAPI mit IfcOpenShell | `qto` MongoDB |
| **NHMzh Kostenberechnung** | Anwendung von Kostenkennwerten auf ermittelte Mengen | React/TypeScript (Vite) | Node.js/Express (TypeScript) | `cost` MongoDB |
| **NHMzh Ökobilanzierung (LCA)** | Berechnung von Umweltauswirkungen basierend auf KBOB-Daten | React/TypeScript (Vite) | Node.js/Express (TypeScript) | `lca` MongoDB |

## Datenfluss

```
IFC-Modell → Kafka → Plugin-QTO (MongoDB) → Plugin-Cost (direkte DB-Abfrage) → Plugin-LCA (direkte DB-Abfrage) → Kafka → Dashboard
```

### Workflow

1. **NHMzh Mengenermittlung**: Extrahiert Mengen und Materialien aus IFC-Modellen und speichert sie in der `qto`-Datenbank
2. **NHMzh Kostenberechnung**: Liest QTO-Daten direkt aus der Datenbank, wendet Kostenkennwerte an und berechnet Gesamtkosten
3. **NHMzh Ökobilanzierung**: Liest QTO-Materialdaten, berechnet Umweltauswirkungen (GWP, UBP, PENR) basierend auf KBOB-Kennwerten
4. **Integration**: Alle Module teilen sich eine MongoDB-Instanz mit separaten Datenbanken für jedes Plugin

## Kommunikationsarchitektur

Das NHMzh-System basiert auf **direkten MongoDB-Datenbankabfragen** zwischen den Modulen:

- **Interne Kommunikation**: Direkte Datenbankabfragen zwischen Plugin-QTO, Plugin-Cost und Plugin-LCA
- **Externe Kommunikation**: Für die Anbindung an IFC Upload (bereitgestellt durch [Infrastructure & Core Team](../../infrastructure-team/overview)) sowie die Übertragung von Endergebnissen an externe Dashboards wird Kafka verwendet
- **Datenbank**: MongoDB mit separaten Datenbanken für jedes Plugin (`qto`, `cost`, `lca`)

## Dokumentation

### Für Anwender

Als Anwender werden in dieser Dokumentation Personen verstanden, die die Plugins verwenden, um Projekte zu verarbeiten, Daten zu bearbeiten und Ergebnisse zu interpretieren.

- **[IFC-Modellierungsrichtlinien](./generelles/ifc-guidelines)** - Leitfaden zur optimalen IFC-Erstellung
- **[Berechnungslogik](./generelles/berechnungslogik)** - Wie Mengen, Kosten und Umweltauswirkungen berechnet werden
- **[Mengenermittlung](./qto/intro)** - Arbeiten mit dem QTO-Plugin (inkl. Entwickler-Details)
- **[Kostenberechnung](./cost/intro)** - Kostenkennwerte verwalten und Kosten berechnen (inkl. Entwickler-Details)
- **[Ökobilanzierung](./lca/intro)** - Material-Mapping und LCA-Ergebnisse verstehen (inkl. Entwickler-Details)

## Förderung & Urheberschaft

Dieses Projekt wurde durch die Stadt Zürich finanziert. Der gesamte Quellcode der Plugins **Mengenermittlung (QTO)**, **Kostenberechnung** und **Ökobilanzierung (LCA)** stammt von Louis Trümpler (LTplus AG).
