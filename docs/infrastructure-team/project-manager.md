---
title: Project Manager
description: Verwaltung von Projekten, Phasen und Teamzuordnungen im NHMzh System
sidebar_position: 3
slug: /infrastructure-team/project-manager
tags: [projects, teams, management]
---

# NHMzh Project Manager Plugin

**Projekt- und Teamverwaltung** – Dieses Plugin verwaltet Projekte (Code, Name, Phase, Fachbereich) und deren zugeordnete Benutzer samt Rollen. Es bildet die Grundlage, damit andere Plugins (IFC Uploader, QTO, Kosten, LCA, Dashboard) konsistent auf einen Projektkontext zugreifen.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4.svg?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)

## Was macht das Plugin?

- Legt neue Projekte an (inkl. externem ERZ Projektcode)
- Verwalten von Phase und Fachabteilung (ServiceDepartment)
- Hinzufügen / Entfernen von Teammitgliedern mit Rollen
- Abfrage und Anzeige von Keycloak Benutzergruppen
- Aktualisierung von Projektdetails und Phase

## Schnelleinstieg

1. "Projekt erstellen" öffnen
2. ERZ Projektcode & Namen erfassen, Phase wählen
3. Teammitglieder über Suche hinzufügen und Rolle setzen
4. Speichern – Projekt erscheint in der Liste (abhängig von Berechtigung)
5. Bei Fortschritt Phase anpassen oder Mitglieder ändern

## Berechtigungen

- Admin sieht und verwaltet alle Projekte
- Standardbenutzer nur eigene Projekte
- Rollenfeld `Role` innerhalb eines Projekts ist nicht system-validiert (rein textuell)
- Projektphasen sind als hart codiertes Enum im Code hinterlegt (Erweiterung nur durch Entwickleränderung)

:::info Keycloak Bezug
Ausführliche Informationen zu Usern und Gruppen (Rollen) findest du in der [Keycloak Dokumentation](./keycloak).
:::

## Datenfluss Einbindung

Andere Plugins lesen Projektstammdaten (Id / Code / Phase) für Filter & Anzeige; das Plugin berechnet keine fachlichen Kennzahlen.

## Für Entwickler

:::note
Technische Informationen – für Anwender nicht erforderlich.
:::

<details>
<summary>Technische Übersicht</summary>

### Datenmodell

| Feld                 | Typ      | Beschreibung               |
| -------------------- | -------- | -------------------------- |
| Id                   | Guid     | Interne Kennung            |
| ErzProjectCode       | string   | Externer Projektidentifier |
| Name                 | string   | Anzeigename                |
| Phase                | Enum     | Projektphase               |
| ServiceDepartment    | Enum     | Fachabteilung              |
| LastModified         | DateTime | Änderungstimestamp         |
| ProjectAssignments[] | Liste    | Benutzer/Rollen Zuordnung  |

Assignment:
| Feld | Typ | Beschreibung |
|----------|------|-------------------------------|
| Id | int | Interne Kennung |
| ProjectId| Guid | Referenz auf Projekt |
| UserId | Guid | Benutzer (Keycloak) |
| Role | string | Textuelle Projektrolle |

### API Endpunkte (v1)

| Methode | Pfad                             | Beschreibung                |
| ------- | -------------------------------- | --------------------------- |
| POST    | `/api/v1/Projects`               | Projekt erstellen           |
| GET     | `/api/v1/Projects`               | Projekte auflisten          |
| GET     | `/api/v1/Projects/{id}`          | Projektdetails              |
| PUT     | `/api/v1/Projects/{id}`          | Projekt aktualisieren       |
| DELETE  | `/api/v1/Projects/{id}`          | Projekt löschen             |
| GET     | `/api/v1/Projects/projectPhases` | Phasen abrufen              |
| GET     | `/api/v1/Users`                  | Benutzerliste               |
| GET     | `/api/v1/Users/groups`           | Gruppen / Rollen            |
| POST    | `/api/v1/Users/{id}/groups`      | Benutzer zu Gruppe zuordnen |

### Kafka Event

Topic: `ekkodale.projekt.projektmanager.public`

Header:
| Key | Wert |
|-----------|---------------------|
| UseCase | None |
| UserGroup | None |
| Entity | Project |
| Version | v1 |
| EventName | created/updated/deleted |

Payload Beispiele:
Created/Updated:

```json
{
  "ProjectId": "<guid>",
  "ErzProjectCode": "<string>",
  "Name": "<string>",
  "PhaseId": "<enum>",
  "Members": [{ "MemberId": "<guid>", "Roles": ["RoleA", "RoleB"] }]
}
```

Deleted:

```json
{ "ProjectId": "<guid>" }
```

</details>

## FAQ

**Warum sehe ich ein Projekt nicht?** – Keine Zuordnung oder fehlende Admin-Berechtigung.

**Kann ich eine Rolle ändern?** – Ja, im Projekt bearbeiten → Rolle anpassen → speichern.

**Werden entfernte Mitglieder protokolliert?** – Aktuell nein, Zuordnung wird gelöscht.

**Muss der ERZ Code eindeutig sein?** – Ja, er dient als fachlicher Schlüssel.
