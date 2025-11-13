---
title: Plugin Host
description: Zentrale Verwaltung und Auslieferung der Microfrontend Plugins (Listing, Token-Exchange, Datei-Serving, Gruppenverwaltung)
sidebar_position: 13
---

# NHMzh Plugin Host

**Zentrale Drehscheibe für Microfrontends** – Der Plugin Host verwaltet Plugin-Metadaten, Gruppen, Versionen und liefert die notwendigen Remote-Dateien (Module Federation) inklusive Token-Exchange für sichere, plugin-spezifische Authentifizierung.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-512BD4.svg?style=for-the-badge&logo=dotnet&logoColor=white)](https://learn.microsoft.com/aspnet/core)
[![MinIO](https://img.shields.io/badge/MinIO-CE202E.svg?style=for-the-badge&logo=minio&logoColor=white)](https://min.io/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)

## Was macht das Plugin?

- Listet verfügbare Plugins (inkl. neueste Versionen)
- Filtert plugins auf Basis von Nutzer-Rollen ("Licenses")
- Token-Exchange für plugin-spezifische Requests
- Auslieferung von `remoteEntry.js` & Icon-Dateien über signierte Kurz-URLs
- Verwaltung von Plugin-Gruppen & Reihenfolge
- Upload & Löschung von Plugin-Versionen (Admin)

## Einsatz im Gesamtworkflow

```
Login (Keycloak) → Host liefert Pluginliste → Nutzer wählt Plugin → Token-Exchange → Dynamisches Laden (Module Federation) → Plugin nutzt eigenes Backend
```

Der Host ist nur für Metadaten & statische Bundles zuständig, kein fachlicher Rechenkern.

## Schnelleinstieg (Anwender)

1. Anmelden (JWT enthält Rollen → Lizenzen)
2. Pluginübersicht ruft `/api/v1/Plugins/myPlugins` auf
3. Ein Klick auf ein Plugin lädt dessen Module Federation `remoteEntry.js`
4. Token-Exchange erfolgt automatisch im Hintergrund (sichtbar durch kurzzeitiges "Loading plugin...")
5. Plugin UI erscheint

## Daten & Konzepte

| Begriff        | Bedeutung                                                    |
| -------------- | ------------------------------------------------------------ |
| Plugin         | Microfrontend mit eigener Route & Icon                       |
| Version        | Eindeutige Bundle-Version (`VersionCode` / `Version`)        |
| Gruppe         | Logische UI Gruppierung                                      |
| License        | Keycloak Rolle im JWT zur Freischaltung                      |
| Token-Exchange | Austausch Haupt-Access-Token gegen plugin-spezifischen Token |
| Signed URL     | Kurzzeit-URL mit JWT für Dateiabruf                          |

### Plugin Felder (Entity)

| Feld           | Beschreibung                            |
| -------------- | --------------------------------------- |
| `Id`           | Eindeutige Kennung                      |
| `PluginName`   | Interner Name (auch für Token-Exchange) |
| `Module`       | Einstiegspunkt Modul (`./<module>`)     |
| `VersionCode`  | Numerischer Versionszähler (Sortierung) |
| `Version`      | Menschlich lesbare Version              |
| `DisplayName`  | Anzeigename im UI                       |
| `Description`  | Optionale Beschreibung                  |
| `Route`        | Basis-Route des Plugins                 |
| `IconFilename` | Dateiname des Icons im Storage          |
| `GroupId`      | Gruppenzuordnung                        |

### Token-Exchange Ablauf

1. Host-Client authentifiziert (Keycloak) → `access_token`
2. Anfrage `POST /api/v1/Plugins/{pluginName}/token` mit aktuellem Token
3. Antwort enthält plugin-spezifisches `access_token` (ggf. geringerer Scope)
4. Plugin wird mit neuem Token über OIDC Kontext initialisiert

## API Endpunkte (v1)

| Methode | Pfad                                    | Beschreibung                                         |
| ------- | --------------------------------------- | ---------------------------------------------------- |
| GET     | `/api/v1/Plugins`                       | Alle neuesten Versionen aller Plugins (Admin + Auth) |
| GET     | `/api/v1/Plugins/myPlugins`             | Nur Plugins für vorhandene Lizenzen                  |
| GET     | `/api/v1/Plugins/{pluginName}`          | Neueste Version eines Plugins (Admin)                |
| GET     | `/api/v1/Plugins/{pluginName}/versions` | Alle Versionen eines Plugins (Admin)                 |
| POST    | `/api/v1/Plugins`                       | Neues Plugin (multipart Upload, Admin)               |
| DELETE  | `/api/v1/Plugins/{pluginId}`            | Löschen einer Plugin-Version (Admin + Lizenz)        |
| POST    | `/api/v1/Plugins/{clientId}/token`      | Token-Exchange für Plugin                            |
| GET     | `/api/v1/Plugins/{token}/{filename}`    | Dateiabruf (remoteEntry.js/Icon) – anonym            |
| PATCH   | `/api/v1/Plugins/reorder`               | Reihenfolge & Gruppen patchen (Admin)                |
| GET     | `/api/v1/Plugins/groups`                | Alle Gruppen (Admin)                                 |
| POST    | `/api/v1/Plugins/groups`                | Gruppe anlegen (Admin)                               |
| DELETE  | `/api/v1/Plugins/groups/{groupId}`      | Gruppe löschen (Admin)                               |

## Berechtigungen

- Authentifizierung via Keycloak JWT (Realm Rollen → Lizenzen)
- Admin Policy (`AdminOnly`) für Verwaltungs-Endpunkte
- Datei-Endpunkt (`{token}/{filename}`) ist anonym, Schutz über signierten Token
- Token-Exchange nur für authentifizierte Benutzer

## Häufige Fehler & Hinweise

| Problem                | Ursache                                | Lösung                                |
| ---------------------- | -------------------------------------- | ------------------------------------- |
| Keine Plugins sichtbar | Rollenclaim leer                       | Rolle in Keycloak zuweisen            |
| Upload schlägt fehl    | Ungültiges Multipart / fehlende Felder | Felder prüfen (`PluginName`, Dateien) |
| 403 bei Delete         | Lizenz fehlt für Plugin                | Rolle ergänzen oder Admin prüfen      |
| Datei 404              | Icon / remoteEntry fehlt im Storage    | Upload erneut durchführen             |
| Token-Exchange Fehler  | Abgelaufener Haupt-Token               | Neu anmelden                          |

## Nutzungstipps

- PluginName konsistent (klein / keine Leerzeichen) für Federation laden
- VersionCode strikt inkrementieren für Sortierung
- Gruppen minimal halten für klare Navigation
- Icons leichtgewichtig (SVG bevorzugt)

## Environment Variablen (Auszug)

| Variable                             | Bedeutung                 |
| ------------------------------------ | ------------------------- |
| `PLUGINHOST_SERVER_HOSTURL`          | Basis-URL der Server API  |
| `KEYCLOAK_BACKEND_CLIENT_ID`         | Client Id für Server Auth |
| `KEYCLOAK_BACKEND_CLIENT_SECRET`     | Client Secret             |
| `KEYCLOAK_REALM`                     | Keycloak Realm            |
| `KEYCLOAK_SERVER_HOSTURL`            | Keycloak Base URL         |
| `MINIO_PORT1`                        | MinIO Port                |
| `HOST_MINIO_ACCESSKEY` / `SECRETKEY` | MinIO Zugangsdaten        |
| `PLUGINHOST_CLIENT_HOSTNAME`         | Hostname Client           |
| `ASPNETCORE_ENVIRONMENT`             | Laufzeitumgebung          |

## Grenzen (Ist-Zustand)

- Keine feingranulare Scopes im Token-Exchange dokumentiert (alle Claims durchgereicht)
- Keine Version-Rollback Logik in API
- Signierte Datei-URLs: Ablauf- / Sicherheitsdetails nicht extern konfigurierbar dokumentiert

## Für Entwickler (Kurz)

<details>
<summary>Technische Übersicht</summary>

### Architektur

```
Client (React + Vite Federation) → Plugin Host API (ASP.NET Core) → MinIO (Bundles/Icons)
                                      ↘ Keycloak (JWT/Token-Exchange)
                                      ↘ PostgreSQL (Plugin & Group Tabellen)
```

### Ablauf Plugin Laden

1. GET `/api/v1/Plugins/myPlugins` → Liste mit `url` (signed remoteEntry)
2. `DynComponent` setzt Remote via `__federation_method_setRemote`
3. Token-Exchange → neuer OIDC User mit plugin-spezifischem Access Token
4. Laden Modul `./<Module>` aus Remote

### Wichtige Klassen

- `PluginsController` (REST Endpunkte)
- `PluginEntity` (Metadaten)
- `PluginGroup` (UI Gruppierung)
- `PluginToken` (Signierung für Datei-URLs)

### Sicherheit

- JWT Realm Rollen → Lizenzfilter
- Signierte Token für Datei-Endpunkt (Icon / remoteEntry)
- Admin Policy für Verwaltungsoperationen

### Versionierung

- `VersionCode` (int) + `Version` (String)
- Repository liefert nur neueste Version bei Standardabfragen

### Entwicklung eines neuen Plugins (Kurzübersicht)

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

### Upload Anforderungen (Zusammenfassung)

- Pflichtdatei: `remoteEntry.js` (Mapping der exposes)
- Icon: Einzelne Bilddatei (SVG bevorzugt)
- Route muss mit internen Links kompatibel sein (absolute Pfade basierend auf Mount, keine doppelten Router).
- Versionierung: `VersionCode` strikt inkrementell, `Version` frei (SemVer empfohlen).

### Gemeinsame Snackbar Nutzung

Plugins können die Host Snackbar verwenden:

```ts
import { useSnackbar } from "host/useSnackbar";
useSnackbar()("Upload erfolgreich", "success");
```

Hinweis: Im Standalone-Betrieb nicht verfügbar – nur innerhalb des Host geladenen Kontextes.

</details>

## Glossar

| Begriff        | Erklärung                                   |
| -------------- | ------------------------------------------- |
| RemoteEntry    | Module Federation Manifest eines Plugins    |
| License        | Rolle aus Keycloak zur Aktivierung          |
| Token-Exchange | Austausch Haupt-Token gegen pluginbezogenes |
| Signed URL     | Kurzzeit-Zugriff auf Datei mit JWT          |
| PluginGroup    | UI Gruppierung für Navigation               |

## FAQ

**Warum erscheint mein neues Plugin nicht?** – Prüfe ob deine Rolle (License) dem PluginName entspricht und ob der Upload erfolgreich war.

**Was ist der Unterschied zwischen `myPlugins` und `/Plugins`?** – `myPlugins` filtert nach Rollen, `/Plugins` zeigt komplette Liste (Admin).

**Kann ich ältere Versionen aktivieren?** – API liefert alle Versionen, Standardanzeige nutzt jüngste; Umschalten derzeit nur manuell/administrativ.

**Wozu der Token-Exchange?** – Um plugin-spezifische Auth-Kontexte zu isolieren und separate Clients in Keycloak zu verwenden.

**Wird das Icon gecacht?** – Auslieferung erfolgt über signierte URL; Browser-Caching abhängig vom Response Header (Standard).
