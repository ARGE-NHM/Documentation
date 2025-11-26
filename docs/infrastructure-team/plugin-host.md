---
title: Plugin Host (Admin)
description: Backend-Infrastruktur für Microfrontend Plugins (Listing, Datei-Serving, Token-Exchange, Lizenzprüfung)
sidebar_position: 5
slug: /infrastructure-team/plugin-host
tags: [plugin-host, federation, token-exchange]
---

# NHMzh Plugin Host

**Zentrale Drehscheibe für Microfrontends** – Der Plugin Host verwaltet Plugin-Metadaten, Gruppen, Versionen und liefert die notwendigen Remote-Dateien (Module Federation) inklusive Token-Exchange für sichere, plugin-spezifische Authentifizierung.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4.svg?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core)
[![MinIO](https://img.shields.io/badge/MinIO-CE202E.svg?style=for-the-badge&logo=minio&logoColor=white)](https://min.io/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)

## Aufgaben des Plugin Host

- Liefert gefilterte Pluginliste (nur freigeschaltete Lizenzen/Rollen)
- Stellt signierte Kurz-URLs für `remoteEntry.js` & Icons bereit
- Führt Token-Exchange für ein ausgewähltes Plugin durch
- Prüft Keycloak Rollen (Licenses) für Sichtbarkeit
- Hält Gruppen & Reihenfolge (wird via Plugin Manager geändert)
- Aggregiert Metadaten (Name, Route, DisplayName, Icon, Version)

## Rolle im Gesamtworkflow

```
Login (Keycloak) → Plugin Host liefert gefilterte Liste → Nutzer wählt Plugin → Token-Exchange → Dynamisches Laden (Module Federation) → Plugin nutzt eigenes Backend
```

Der Host enthält keinerlei fachliche Logik eines Fachmoduls – er ist reiner Infrastruktur-Layer (Metadaten, Dateien, Rollenprüfung, Token-Delegation).

## Abgrenzung Plugin Host vs. Plugin Manager

:::info Verantwortlichkeiten
Der [Plugin Manager](./plugin-manager) ist die Admin UI für Upload, Versionierung, Gruppenpflege und Reihenfolge. Der Plugin Host selbst stellt dafür nur REST Endpunkte und die Laufzeit-Infrastruktur zum Laden & Lizenzprüfen bereit.
:::

Kurz:

- Plugin Host = Backend Infrastruktur (Listing, Signierung, Token-Exchange, Lizenzfilter)
- Plugin Manager = Administrator UI (Änderungen & Pflege)

## Schnelleinstieg

:::tip
Mit gültigem Login einfach ein Plugin anklicken – Token-Exchange läuft automatisch.
:::

1. Anmelden (JWT enthält Rollen → Lizenzen)
2. Pluginübersicht ruft `/api/v1/Plugins/myPlugins` auf
3. Ein Klick auf ein Plugin lädt dessen Module Federation `remoteEntry.js`
4. Token-Exchange erfolgt automatisch im Hintergrund (sichtbar durch kurzzeitiges "Loading plugin...")
5. Plugin UI erscheint

## Kernkonzepte

| Begriff    | Bedeutung                              |
| ---------- | -------------------------------------- |
| Plugin     | Microfrontend mit eigener Route & Icon |
| License    | Keycloak Rolle zur Freischaltung       |
| Gruppe     | UI-Gruppierung für Navigation          |
| Version    | Neueste Bundle-Version eines Plugins   |
| Signed URL | Kurzzeit-URL für Icon / remoteEntry    |

## Lizenz- & Rollenprüfung

- Sichtbare Plugins basieren auf Rollen (Licenses)
- Upload / Delete / Reorder nur für Admin-Gruppe
- Dateiabruf Links (Icons, remoteEntry) sind signiert

:::info Keycloak Rollen
Die Zuweisung von Rollen (Licenses) für die Plugin-Freischaltung erfolgt in Keycloak. Details findest du in der [Keycloak Dokumentation](./keycloak).
:::

## Für Entwickler (Detailübersicht)

:::note
Technische Details zum Laden und zur Sicherheit.
:::

<details>
<summary>Technische Übersicht</summary>

### Architektur (Überblick)

```
Client (React + Vite Federation) → Plugin Host API (ASP.NET Core) → MinIO (Bundles/Icons)
                                      ↘ Keycloak (JWT/Token-Exchange)
```

### Ablauf: Laden eines Plugins

1. GET `/api/v1/Plugins/myPlugins` → Liste mit `url` (signed remoteEntry)
2. `DynComponent` setzt Remote via `__federation_method_setRemote`
3. Token-Exchange → neuer OIDC User mit plugin-spezifischem Access Token
4. Laden Modul `./<Module>` aus Remote

### Zentrale Klassen / Entities

- `PluginsController` (REST Endpunkte)
- `PluginEntity` (Metadaten)
- `PluginGroup` (UI Gruppierung)
- `PluginToken` (Signierung für Datei-URLs)

### Sicherheit & Auth

- JWT Realm Rollen → Lizenzfilter
- Signierte Token für Datei-Endpunkt (Icon / remoteEntry)
- Admin Policy für Verwaltungsoperationen

### Versionierung & Auswahl

- `VersionCode` (int) + `Version` (String)
- Repository liefert nur neueste Version bei Standardabfragen

### Entwicklung eines neuen Plugins (Kontext)

1. Neues Vite React TS Projekt erstellen:
   ```bash
   npm create vite@latest my-plugin -- --template react-ts
   cd my-plugin
   npm i
   ```
2. Federation Plugin installieren:
   ```bash
   npm i @originjs/vite-plugin-federation --save-dev
   npm i react-router-dom
   ```
3. `vite.config.ts` konfigurieren (Beispiel):
   ```ts
   federation({
     name: "mein-plugin",
     filename: "remoteEntry.js",
     exposes: { "./App": "./src/App.tsx" },
     shared: ["react", "react-dom", "react-router-dom"],
   });
   ```
4. Routen im Plugin nur relativ definieren:
   ```tsx
   <Routes>
     <Route path="/" element={<Overview />} />
     <Route path="/details" element={<Details />} />
   </Routes>
   ```
5. Optionales Standalone Testing (eigener Router unter Mount-Pfad):
   ```tsx
   <BrowserRouter>
     <Routes>
       <Route path="/mein-plugin/*" element={<App />} />
     </Routes>
   </BrowserRouter>
   ```
6. Build erzeugt `dist/assets/remoteEntry.js` + Bundles → diese Dateien werden im Plugin Manager hochgeladen.
7. Naming:
   - `PluginName` muss eindeutig & stabil sein (entspricht Federation `name`).
   - Exposed Module Key (z.B. `./App`) wird im Manager gewählt ohne `./`.

### Upload Anforderungen (vom Plugin Manager erfüllt)

- Pflichtdatei: `remoteEntry.js` (Mapping der exposes)
- Icon: Einzelne Bilddatei (SVG bevorzugt)
- Route muss mit internen Links kompatibel sein (absolute Pfade basierend auf Mount, keine doppelten Router).
- Versionierung: `VersionCode` strikt inkrementell, `Version` frei (SemVer empfohlen).

### Plugin Entity Felder

| Feld         | Beschreibung                    |
| ------------ | ------------------------------- |
| Id           | Eindeutige Kennung              |
| PluginName   | Interner Name / Federation name |
| Module       | Einstiegspunkt (`./<Module>`)   |
| VersionCode  | Numerischer Zähler              |
| Version      | Lesbare Version                 |
| DisplayName  | UI Anzeigename                  |
| Description  | Optionale Beschreibung          |
| Route        | Basisroute                      |
| IconFilename | Dateiname Icon                  |
| GroupId      | Gruppenzuordnung                |

### Token-Exchange Ablauf (Detail)

1. Authentifizierter Host-Client sendet POST `/api/v1/Plugins/{pluginName}/token`
2. Server tauscht Token gegen plugin-spezifischen Client-Token
3. Frontend initialisiert OIDC Kontext mit neuem Token
4. Remote Modul wird geladen

### API Endpunkte (v1) Infrastruktur

| Methode | Pfad                                    | Beschreibung                      |
| ------- | --------------------------------------- | --------------------------------- |
| GET     | `/api/v1/Plugins`                       | Neueste Versionen aller Plugins   |
| GET     | `/api/v1/Plugins/myPlugins`             | Gefilterte Liste nach Rollen      |
| GET     | `/api/v1/Plugins/{pluginName}`          | Neueste Version eines Plugins     |
| GET     | `/api/v1/Plugins/{pluginName}/versions` | Alle Versionen                    |
| POST    | `/api/v1/Plugins`                       | Upload Plugin-Version (multipart) |
| DELETE  | `/api/v1/Plugins/{pluginId}`            | Plugin-Version löschen            |
| POST    | `/api/v1/Plugins/{clientId}/token`      | Token-Exchange                    |
| GET     | `/api/v1/Plugins/{token}/{filename}`    | Signierter Dateiabruf             |
| PATCH   | `/api/v1/Plugins/reorder`               | Reihenfolge/Gruppen setzen        |
| GET     | `/api/v1/Plugins/groups`                | Gruppen auflisten                 |
| POST    | `/api/v1/Plugins/groups`                | Gruppe anlegen                    |
| DELETE  | `/api/v1/Plugins/groups/{groupId}`      | Gruppe löschen                    |

### Relevante Environment Variablen

| Variable                         | Bedeutung             |
| -------------------------------- | --------------------- |
| PLUGINHOST_SERVER_HOSTURL        | Basis URL API         |
| KEYCLOAK_BACKEND_CLIENT_ID       | Backend Client Id     |
| KEYCLOAK_BACKEND_CLIENT_SECRET   | Backend Client Secret |
| KEYCLOAK_REALM                   | Realm Name            |
| KEYCLOAK_SERVER_HOSTURL          | Keycloak Base URL     |
| MINIO_PORT1                      | MinIO Port            |
| HOST_MINIO_ACCESSKEY / SECRETKEY | MinIO Zugang          |
| PLUGINHOST_CLIENT_HOSTNAME       | Hostname Client       |
| ASPNETCORE_ENVIRONMENT           | Umgebung              |

</details>

## FAQ

**Warum erscheint mein neues Plugin nicht?** – Prüfe ob deine Rolle (License) dem PluginName entspricht und ob der Upload erfolgreich war und logge dich nochmal neu ein.
