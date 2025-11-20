---
title: Plugin Manager (Admin)
description: Administrationsoberfläche zur Pflege von Microfrontend Plugins (Upload, Versionen, Gruppen, Reihenfolge)
sidebar_position: 6
slug: /infrastructure-team/plugin-manager
tags: [plugin-manager, admin, federation]
---

# Plugin Manager

**Verwaltungsschicht – kein fachliches Plugin**: Der Plugin Manager ist eine administrative React/Vite Oberfläche, die die REST API des `Plugin Host` nutzt. Er dient ausschließlich zur Pflege von Plugin-Metadaten, Versionen, Gruppen und Reihenfolge (Reorder). Fachliche Funktionalität liegt immer in den einzelnen Plugins.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)

## Abgrenzung zum Plugin Host

:::info Infrastruktur vs. Verwaltung
Der [Plugin Host](./plugin-host) ist das Backend (Listing, Token-Exchange, Lizenzprüfung, Datei-Serving). Der Plugin Manager ist die Admin UI, die diese API nutzt (Upload, Gruppenpflege, Versionierung, Reorder).
:::

Kurz:

- Plugin Host = Infrastruktur Backend
- Plugin Manager = Administrative Pflegeoberfläche

## Funktionsumfang (Admin)

- Alle Plugins (neueste Version) anzeigen
- Einzelnes Plugin und alle Versionen einsehen
- Neue Plugin-Version hochladen (inkl. `remoteEntry.js`, Modul-Bundles, Icon)
- Module aus `remoteEntry.js` automatisch auslesen (Map Parsing)
- Version inkrementieren (Vorbelegung +1)
- Plugin-Gruppen anzeigen, anlegen, löschen
- Reihenfolge und Gruppenzuordnung per UI verändern und anwenden (PATCH)
- Plugin-Version löschen (falls Lizenz / Admin)

## Schnelleinstieg (Upload Ablauf)

:::tip Wizard Nutzung
Alle Schritte führen dich durch einen konsistenten Upload. Prüfe nach Schritt 2 ob `remoteEntry.js` korrekt eingelesen wurde.
:::

1. Öffnen der Übersicht → lädt `/api/v1/Plugins`
2. Klick auf "New Plugin" → 3-Schritt Wizard
   - Allgemeine Infos (Name, Version, Route, Gruppe)
   - Dateien hochladen (Bundles + Icon, zwingend `remoteEntry.js`)
   - Modul auswählen (aus extrahierter Liste) & finale Prüfung
3. Finish → Upload via `POST /api/v1/Plugins` multipart
4. Liste aktualisiert sich (neue Version erscheint in Gruppe)
5. Optional: Reihenfolge anpassen → "Apply Plugin Order" sendet `PATCH /reorder`

## Kernbegriffe

| Begriff     | Bedeutung                             |
| ----------- | ------------------------------------- |
| Plugin      | Microfrontend Bundle                  |
| VersionCode | Numerischer Sortierwert               |
| Gruppe      | UI Gruppierung                        |
| Reorder     | Reihenfolge/Gruppen in einem Patch    |
| Lizenz      | Keycloak Rolle für Sichtbarkeit/Admin |

## Typische Aktionen

- Plugins & Versionen anzeigen
- Neue Version hochladen (Wizard)
- Version löschen
- Gruppen anlegen / löschen
- Reihenfolge anwenden (Reorder)

## Rollen & Berechtigungen

- Admin-Rolle (Realm-Rolle / License in Keycloak) erforderlich für Upload, Löschen, Gruppenpflege, Reorder
- Lesen erfordert gültigen Login; Sichtbarkeit gefiltert durch Lizenz-Rollen
- Lizenz-/Rollenverwaltung erfolgt ausschliesslich in Keycloak (siehe [Keycloak Kurzreferenz](./keycloak))

## Für Entwickler (Technik Details)

:::note
Technische Übersicht zur internen Funktionsweise.
:::

<details>
<summary>Technische Übersicht & Implementierung (gekürzt – vollständige Plugin-Erstellung siehe Plugin Entwicklung)</summary>

### Architektur

```
Plugin Manager (React/Vite) → Plugin Host API (CRUD Plugins & Gruppen) → MinIO (Dateien)
                                            ↘ Keycloak (JWT für Auth)
```

### Wichtige Komponenten

- `PluginList` (Gruppierung, Reorder Logik, PATCH Anwendung)
- `PluginForm` (Wizard Upload: Validierung + Modul-Extraktion)
- `InputGeneralInfos`, `InputUploadFiles`, `InputPluginConfig` (Teil-Schritte)
- `useFetchPluginGroups` (React Query Hook für Gruppen)
- `PluginsService` (OpenAPI generierter Client)
- Host Remote Nutzung: `useSnackbar` (Kontext vom Plugin Host, in Standalone nicht verfügbar)

### Sicherheit

- Auth via Keycloak (Rollen → Admin / Lizenz)
- Keine zusätzliche Token-Exchange für Manager UI selbst

### Upload Felder (Form)

| Feld         | Beschreibung                                    |
| ------------ | ----------------------------------------------- |
| DisplayName  | Anzeigename im UI                               |
| Description  | Optionale Beschreibung                          |
| PluginName   | Interner eindeutiger Name                       |
| Module       | Einstieg-Modul aus remoteEntry                  |
| Version      | Lesbare Version (SemVer)                        |
| VersionCode  | Fortlaufender int (Auto +1)                     |
| Route        | Basis-Route                                     |
| IconFilename | Icon Dateiname                                  |
| GroupId      | Gruppe                                          |
| Files[]      | Alle hochgeladenen Dateien inkl. remoteEntry.js |

### API Nutzung

| Aktion                   | Endpoint                                | Methode          |
| ------------------------ | --------------------------------------- | ---------------- |
| Liste laden              | `/api/v1/Plugins`                       | GET              |
| Plugin Details           | `/api/v1/Plugins/{pluginName}`          | GET              |
| Alle Versionen           | `/api/v1/Plugins/{pluginName}/versions` | GET              |
| Upload Plugin            | `/api/v1/Plugins`                       | POST (multipart) |
| Löschen                  | `/api/v1/Plugins/{pluginId}`            | DELETE           |
| Gruppen anzeigen         | `/api/v1/Plugins/groups`                | GET              |
| Gruppe anlegen           | `/api/v1/Plugins/groups`                | POST             |
| Gruppe löschen           | `/api/v1/Plugins/groups/{groupId}`      | DELETE           |
| Reorder & Gruppenwechsel | `/api/v1/Plugins/reorder`               | PATCH            |

### Environment Variablen (Client)

| Variable                | Zweck                     |
| ----------------------- | ------------------------- |
| VITE_API_URL            | Basis-URL zum Plugin Host |
| VITE_KEYCLOAK_AUTHORITY | Keycloak Realm URL        |
| VITE_KEYCLOAK_CLIENT_ID | Frontend Client Id        |

</details>

## Weiterführende Entwicklung

Für die Erstellung neuer Plugins, Federation-Konfiguration, Routing und Best Practices siehe: [Plugin Entwicklung](./plugin-development)
