---
title: Micro-Frontend Homepage
description: Architektur, Authentifizierung und Funktionsumfang der zentralen NHMzh Startseite
sidebar_position: 11
---

# NHMzh Homepage Plugin

**Zentrale Einstiegsseite & Rollen-Navigation** – Das Homepage Plugin zeigt abhängig von Ihrer Keycloak-Gruppenmitgliedschaft alle verfügbaren Fach-Plugins und ordnet sie als Prozessschritte.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4.svg?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core)

## Was macht das Plugin?

- Zeigt Prozessübersicht (z.B. IFC Upload → Mengenermittlung → Kosten → Ökobilanzierung → Dashboard)
- Filtert sichtbare Plugins anhand Ihrer Gruppen / Rollen
- Verlinkt direkt in die Plugin-Routen
- Liefert Kontextbeschreibung zum Gesamtziel des NHMzh Systems

## Schnelleinstieg

1. Anmelden über Keycloak (automatisch beim ersten Seitenaufruf)
2. Relevante Rolle über Tabs sichtbar (Ihre Gruppen sind hervorgehoben)
3. Plugin aus Prozessliste anklicken → Weiterarbeiten im gewählten Modul
4. Zurück zur Homepage jederzeit über Navigation / Host

## Rollen & Sichtbarkeit

| Zustand            | Anzeige                                                    |
| ------------------ | ---------------------------------------------------------- |
| Rolle aktiv        | Tab ausgewählt & zugehörige Plugins farblich hervorgehoben |
| Rolle in Hover     | Temporär Vorschau anderer Rollen                           |
| Plugin nicht aktiv | Ausgegraut, keine Navigation                               |

Die Plugin-Liste basiert auf dem Matching zwischen Gruppen-Rollen und Plugin-Namen. Nur Plugins, deren interne Kennung in Ihrer Gruppe hinterlegt ist, werden aktiv verlinkt.

## Prozessdarstellung

Die nummerierte Reihenfolge dient als Orientierung – Sie können Module auch unabhängig öffnen.

Beispiel:

```
1. IFC Upload
2. Mengenermittlung (QTO)
3. Kostenberechnung (Cost)
4. Ökobilanzierung (LCA)
5. Dashboard / Analyse
```

## Häufige Aufgaben

| Aufgabe                     | Vorgehen                               |
| --------------------------- | -------------------------------------- |
| Plugin öffnen               | In Prozessliste auf Eintrag klicken    |
| Andere Rolle prüfen         | Mit Maus über Tab fahren               |
| Fehlendes Plugin melden     | Rolle/Zuordnung an Admin kommunizieren |
| Aktualisierte Plugins sehen | Seite neu laden (F5)                   |

## Hinweise zur Nutzung

- Sichtbarkeit wird ausschliesslich durch Keycloak-Gruppen gesteuert
- Nicht sichtbare Plugins: Entweder keine Berechtigung oder Plugin inaktiv
- Beschreibungstexte bieten Kontext – technische Details liegen in jeweiligen Plugin-Dokus

## Nächste Schritte von hier

- IFC Modell hochladen im [IFC Uploader](./ifc-uploader.md)
- Daten prüfen im [QTO Plugin](../mengen-kosten-lca/qto/intro)
- Kosten zuordnen im [Cost Plugin](../mengen-kosten-lca/cost/intro)
- Umweltauswirkungen analysieren im [LCA Plugin](../mengen-kosten-lca/lca/intro)

## Häufige Fragen (FAQ)

**Warum sehe ich nur wenige Tabs?** – Ihre Keycloak-Gruppen definieren die sichtbaren Rollen. Weitere Rollen müssen administrativ zugeordnet werden.

**Ein Plugin ist ausgegraut – was bedeutet das?** – Sie haben keine Rolle mit Zugriff oder das Plugin ist noch nicht freigeschaltet.

**Wie aktualisiere ich die Liste?** – Durch erneutes Laden der Seite (die Gruppen werden jedes Mal abgefragt).

**Warum fehlt ein neues Plugin?** – Plugin muss der passenden Gruppe als Rolle hinzugefügt werden.

## Für Entwickler (Kurz)

<details>
<summary>Technische Übersicht</summary>

### Architektur (Kurz)

```
Client (React + Module Federation) → Homepage API (.NET) → Keycloak Admin API
```

### Datenquellen

- `GroupsService.getGroups()` → Aggregiert Gruppen & deren Rollen
- `PluginsService.getAllPlugin()` → Liefert Plugin Metadaten (Name, Icon, Route)

### Matching Logik (vereinfacht)

```typescript
const matching = plugins.filter((p) => group.realmRoles.includes(p.pluginName));
```

### Auth Flow

- OIDC Login via `react-oidc-context`
- JWT enthält `groups` Claim für UI-Sichtbarkeit
- Backend nutzt Client Credentials zur Admin-Abfrage (Gruppe → Rollen Details)

### Endpunkt

| Methode | Pfad                    | Zweck                  |
| ------- | ----------------------- | ---------------------- |
| GET     | `/api/v1/Groups/groups` | Gruppen + Rollen laden |

### Module Federation Export

```ts
exposes: { "./App": "./src/App.tsx" }
```

### Verbesserungs-Potenzial

- Caching von Gruppen & Plugins
- Lazy Loading großer Plugin-Icons
- i18n für Texte

### Lokales Setup

```bash
cd Client
npm install
npm run dev  # Port 3003

dotnet run --project Service/API.csproj
```

</details>

## Glossar

| Begriff           | Erklärung                                                     |
| ----------------- | ------------------------------------------------------------- |
| Rolle / Gruppe    | Keycloak Gruppenzuordnung zur Steuerung der Sichtbarkeit      |
| Plugin            | Fachmodul im NHMzh System                                     |
| Module Federation | Technischer Mechanismus zum Laden entkoppelter Microfrontends |
| Claim             | Bestandteil eines JWT Tokens (enthält z.B. Gruppen)           |

## Kurzes Troubleshooting

| Problem              | Ursache                               | Lösung                         |
| -------------------- | ------------------------------------- | ------------------------------ |
| Keine Gruppen        | Token fehlt / abgelaufen              | Neu anmelden / Seite neu laden |
| Plugins leer         | Backend / Plugin API nicht erreichbar | Netzwerk & Console prüfen      |
| Falsche Sichtbarkeit | Rollen in Keycloak nicht korrekt      | Admin Kontakt aufnehmen        |
| 401 Fehler           | Ungültiges oder abgelaufenes Token    | Refresh durch Login            |

## Roadmap (Auszug)

- Performanceoptimierung beim Laden vieler Plugins
- Erklärungs-Tooltips für jede Rolle
- Erweiterte Suche / Filter für Plugins
- Audit-Log: Wer öffnet welches Plugin?
