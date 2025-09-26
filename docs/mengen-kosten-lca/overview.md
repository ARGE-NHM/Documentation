---
title: Übersicht
description: Überblick über die Plugins Kosten, LCA und Mengenermittlung
sidebar_position: 1
---

# Mengen-, Kosten und LCA-Plugins

Diese Plugin-Suite umfasst drei integrierte Module für das NHMzh Nachhaltigkeitsmonitoring der Stadt Zürich.

## 🤝 Förderung & Urheberschaft

- **Projektfinanzierung**: Stadt Zürich
- **Entwicklung**: Louis Trümpler, LTplus AG

## 📊 Plugin-Übersicht

### [NHMzh Mengenermittlung](./qto/intro)
Extraktion von Mengen, Materialien und Eigenschaften aus IFC-Modellen.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Python/FastAPI mit IfcOpenShell
- **Quellcode**: [github.com/LTplus-AG/NHMzh-plugin-qto](https://github.com/LTplus-AG/NHMzh-plugin-qto)

### [NHMzh Kostenberechnung](./cost/intro)
Anwendung von Kostenkennwerten auf ermittelte Mengen.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Node.js/Express (TypeScript)
- **Quellcode**: [github.com/LTplus-AG/NHMzh-plugin-cost](https://github.com/LTplus-AG/NHMzh-plugin-cost)

### [NHMzh Ökobilanzierung](./lca/intro)
Berechnung von Umweltauswirkungen basierend auf KBOB-Daten.
- **Frontend**: React/TypeScript (Vite)
- **Backend**: Node.js/Express (TypeScript)
- **Quellcode**: [github.com/LTplus-AG/NHMzh-plugin-lca](https://github.com/LTplus-AG/NHMzh-plugin-lca)

## 📚 Gemeinsame Referenzen

- [IFC-Modellierungsrichtlinien](./shared/ifc-guidelines)
- [Systemarchitektur](./shared/architecture)

## 🔄 Datenfluss

```
IFC-Modell → Mengen-Plugin → Kosten-Plugin → LCA-Plugin → Dashboard
```

1. **NHMzh Mengenermittlung**: Extrahiert Mengen und Materialien aus IFC
2. **NHMzh Kostenberechnung**: Berechnet Kosten basierend auf QTO-Daten
3. **NHMzh Ökobilanzierung**: Berechnet Umweltauswirkungen basierend auf QTO-Materialien
4. **Integration**: Alle Module teilen sich MongoDB-Datenbanken
