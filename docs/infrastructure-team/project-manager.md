---
title: Project Manager Plugin
description: Verwaltung von Projekten, Phasen und Teamzuordnungen im NHMzh System
sidebar_position: 12
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

## Einsatz im Gesamtworkflow

```
Projekt anlegen → IFC Modelle & Daten verarbeiten → Fachmodule nutzen (QTO / Kosten / LCA) → Ergebnisse im Dashboard visualisieren
```

Alle Datenflüsse referenzieren das Projekt (Id / Code) für Kontext & Berechtigungen.

## Schnelleinstieg (Anwender)

1. "Projekt erstellen" öffnen
2. ERZ Projektcode & Namen erfassen, Phase wählen
3. Teammitglieder über Suche hinzufügen und Rolle setzen
4. Speichern – Projekt erscheint in der Liste (abhängig von Berechtigung)
5. Bei Fortschritt Phase anpassen oder Mitglieder ändern

## Daten & Konzepte

| Begriff           | Bedeutung                                      |
| ----------------- | ---------------------------------------------- |
| Projekt           | Container für alle Auswertungen und Ergebnisse |
| ERZ Projektcode   | Externer eindeutiger Organisationscode         |
| Phase             | Lebenszyklusstatus (Enum)                      |
| ServiceDepartment | Zuständige Abteilung (Enum)                    |
| Assignment        | Zuordnung Benutzer ↔ Projekt mit Rolle         |

### Projektfelder

| Feld                 | Typ        | Beschreibung                |
| -------------------- | ---------- | --------------------------- |
| `Id`                 | Guid       | Interne eindeutige Kennung  |
| `ErzProjectCode`     | string     | Externer Projektidentifier  |
| `Name`               | string     | Anzeigename                 |
| `Phase`              | Enum       | Projektphase                |
| `ServiceDepartment`  | Enum       | Fachabteilung               |
| `LastModified`       | DateTime   | Zeitstempel letzte Änderung |
| `ProjectAssignments` | Collection | Teamzuordnungen             |

### Assignment Felder

| Feld        | Typ    | Beschreibung                  |
| ----------- | ------ | ----------------------------- |
| `Id`        | int    | Interne Kennung               |
| `ProjectId` | Guid   | Referenz auf Projekt          |
| `UserId`    | Guid   | Benutzer (Keycloak)           |
| `Role`      | string | Projektrolle (frei definiert) |

## Frontend Funktionen (Ist)

- Projektliste (Admin: alle / Benutzer: nur zugewiesene)
- Detailansicht & Bearbeiten
- Mitglieder hinzufügen / löschen / Rolle ändern
- Phase aktualisieren
- Benutzer & Gruppen aus Keycloak anzeigen

## API Endpunkte (v1)

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

## Kafka Topic

Das Plugin veröffentlicht Änderungen an Projekten als Events auf einem Kafka Topic.

| Topic                                    | Zweck                                                                  | EventName Werte (Header)        | Payload Felder                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ekkodale.projekt.projektmanager.public` | Veröffentlichung von Projekt-Stammdaten bei Erstellen, Ändern, Löschen | `created`, `updated`, `deleted` | `ProjectId`, (bei created/updated zusätzlich: `ErzProjectCode`, `Name`, `PhaseId`, `Members[]`) |

### Header (aktuell)

| Header      | Wert                              |
| ----------- | --------------------------------- |
| `UseCase`   | `None`                            |
| `UserGroup` | `None`                            |
| `Entity`    | `Project`                         |
| `Version`   | `v1`                              |
| `EventName` | `created` / `updated` / `deleted` |

### Payload Struktur (created / updated)

```json
{
  "ProjectId": "<guid>",
  "ErzProjectCode": "<string>",
  "Name": "<string>",
  "PhaseId": "<enum string>",
  "Members": [{ "MemberId": "<guid>", "Roles": ["RoleA", "RoleB"] }]
}
```

### Payload Struktur (deleted)

```json
{ "ProjectId": "<guid>" }
```

Hinweis: `Members` gruppiert Rollen pro Benutzer. Bei Löschung werden keine weiteren Metadaten gesendet.

## Berechtigungen

- Keycloak Token erforderlich (JWT)
- Admin sieht und verwaltet alle Projekte
- Standardbenutzer nur eigene Projekte
- Rollenfeld `Role` innerhalb eines Projekts ist nicht system-validiert (rein textuell)

## Häufige Fehler & Hinweise

| Problem                | Ursache                             | Lösung                             |
| ---------------------- | ----------------------------------- | ---------------------------------- |
| Projekt nicht sichtbar | Keine Zuordnung / keine Admin-Rolle | Rolle prüfen / Zuordnung erstellen |
| Benutzerliste leer     | Keycloak nicht erreichbar           | Verbindung / Token prüfen          |
| Update schlägt fehl    | Ungültige Id                        | Korrekte Projekt-Id verwenden      |
| Gruppenabruf Fehler    | Token abgelaufen                    | Neu anmelden                       |

## Nutzungstipps

- Eindeutige, sprechende Projektcodes verwenden
- Rollen konsistent benennen (z.B. "Planung", "Controlling")
- Phase zeitnah aktualisieren für nachgelagerte Berichte
- Teamänderungen sofort speichern für korrekte Berechtigungsfilter

## Datenfluss Einbindung

Andere Module lesen Projektstammdaten (Id/Code/Phase) zur Filterung und Anzeige; selbst erzeugt das Plugin keine fachlichen Berechnungen.

## Grenzen (Ist-Zustand)

- Rollen frei textuell (keine vordefinierte Liste)
- Phasen fest im Enum hinterlegt
- Entfernte Mitglieder werden gelöscht (keine Historisierung)

## Für Entwickler (Kurz)

<details>
<summary>Technische Übersicht</summary>

### Architektur

```
React Frontend → ASP.NET Core API → PostgreSQL (EF Core) → Keycloak Admin API
```

### CQRS / Mediator

MassTransit Mediator: Handler für Create, Update, Delete, GetById, GetProjects, GetProjectPhases, GetUsers, GetUserRoles, AddUserToGroup (Timeout 30s).

### Persistenz / Migration

EF Core + Npgsql; Migrationen automatisch angewendet beim Start (`Database.MigrateAsync()`).

### Entities (Auszug)

```csharp
public class ProjectEntity {
  Guid Id; string ErzProjectCode; string Name; ProjectPhase Phase;
  ServiceDepartment ServiceDepartment; DateTime LastModified;
  ICollection<ProjectAssignmentEntity> ProjectAssignments;
}
public class ProjectAssignmentEntity {
  int Id; Guid ProjectId; Guid UserId; string Role; ProjectEntity Project;
}
```

### Authentifizierung

JWT Bearer (Keycloak) – Gruppen im `groups` Claim.

### Kafka

`KafkaProducerService` vorhanden (Ist-Zustand ohne dokumentierte fachliche Events).

</details>

## Glossar

| Begriff           | Erklärung                  |
| ----------------- | -------------------------- |
| ERZ Projektcode   | Externer Organisationscode |
| Phase             | Projektlebenszyklus (Enum) |
| Assignment        | Benutzer/Rolle Zuordnung   |
| ServiceDepartment | Zuständige Fachabteilung   |
| Keycloak Gruppe   | Externe Rollenverwaltung   |

## FAQ

**Warum sehe ich ein Projekt nicht?** – Keine Zuordnung oder fehlende Admin-Berechtigung.

**Kann ich eine Rolle ändern?** – Ja, im Projekt bearbeiten → Rolle anpassen → speichern.

**Werden entfernte Mitglieder protokolliert?** – Aktuell nein, Zuordnung wird gelöscht.

**Muss der ERZ Code eindeutig sein?** – Ja, er dient als fachlicher Schlüssel.
