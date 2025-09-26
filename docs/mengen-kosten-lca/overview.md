---
title: Mengen, Kosten & LCA - Übersicht
description: Übersicht der drei NHMzh-Plugins für Mengenermittlung, Kostenberechnung und Ökobilanzierung
sidebar_position: 1
---

# Mengen, Kosten & LCA - Plugin-Suite

Diese Plugin-Suite umfasst drei integrierte Module für das Nachhaltigkeitsmonitoring der Stadt Zürich (NHMzh).

## 🤝 Förderung & Urheberschaft

- **Projektfinanzierung**: Stadt Zürich
- **Entwicklung**: Louis Trümpler, LTplus AG

## 📊 Plugin-Übersicht

### [QTO Plugin - Mengenermittlung](./qto/intro)
Extraktion von Mengen, Materialien und Eigenschaften aus IFC-Modellen.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Python/FastAPI mit IfcOpenShell

### [Cost Plugin - Kostenberechnung](./cost/intro)
Anwendung von Kostenkennwerten auf ermittelte Mengen.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Node.js/Express (TypeScript)

### [LCA Plugin - Ökobilanzierung](./lca/intro)
Berechnung von Umweltauswirkungen basierend auf KBOB-Daten.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Node.js/Express (TypeScript)

## 📚 Gemeinsame Referenzen

- [REST API Dokumentation](./shared/api-documentation)
- [IFC-Modellierungsrichtlinien](./shared/ifc-guidelines)
- [Systemarchitektur](./shared/architecture)

## 🔄 Datenfluss

```
IFC-Modell → QTO Plugin → Cost Plugin → LCA Plugin → Dashboard
```

1. **QTO**: Extrahiert Mengen und Materialien aus IFC
2. **Cost**: Berechnet Kosten basierend auf QTO-Daten
3. **LCA**: Berechnet Umweltauswirkungen basierend auf QTO-Materialien
4. **Integration**: Alle Module teilen sich MongoDB-Datenbanken
