---
title: Plugin Manager
description: Administratives UI zur Pflege von Microfrontend Plugins (Upload, Versionen, Gruppen, Reihenfolge) im Zusammenspiel mit dem Plugin Host
sidebar_position: 14
---

# NHMzh Plugin Manager

**Administrationsoberfläche für Microfrontends** – Der Plugin Manager ist ein React/Vite Client, der direkt mit dem `Plugin Host` Backend kommuniziert. Er ermöglicht das Anlegen, Aktualisieren, Gruppieren und Löschen von Plugin-Versionen sowie das Re-Ordering und die Pflege von Plugin-Gruppen.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Keycloak](https://img.shields.io/badge/Keycloak-4D4D4D.svg?style=for-the-badge&logo=keycloak&logoColor=white)](https://www.keycloak.org/)

## Beziehung zum Plugin Host

- Plugin Manager nutzt ausschließlich die REST API des Plugin Host (`/api/v1/Plugins/...`).
- Kein eigenes Backend – reine Verwaltungsoberfläche.
- Token-Exchange Endpunkt (`POST /api/v1/Plugins/{clientId}/token`) wird indirekt für Plugin-spezifische Authentifizierung von geladenen Plugins genutzt, aber nicht für die Manager UI selbst.

## Was kann der Plugin Manager?

- Alle Plugins (neueste Version) anzeigen
- Einzelnes Plugin und alle Versionen einsehen
- Neue Plugin-Version hochladen (inkl. `remoteEntry.js`, Modul-Bundles, Icon)
- Module aus `remoteEntry.js` automatisch auslesen (Map Parsing)
- Version inkrementieren (Vorbelegung +1)
- Plugin-Gruppen anzeigen, anlegen, löschen
- Reihenfolge und Gruppenzuordnung per UI verändern und anwenden (PATCH)
- Plugin-Version löschen (falls Lizenz / Admin)

## Schnelleinstieg (Admin)

1. Öffnen der Übersicht → lädt `/api/v1/Plugins`
2. Klick auf "New Plugin" → 3-Schritt Wizard
   - Allgemeine Infos (Name, Version, Route, Gruppe)
   - Dateien hochladen (Bundles + Icon, zwingend `remoteEntry.js`)
   - Modul auswählen (aus extrahierter Liste) & finale Prüfung
3. Finish → Upload via `POST /api/v1/Plugins` multipart
4. Liste aktualisiert sich (neue Version erscheint in Gruppe)
5. Optional: Reihenfolge anpassen → "Apply Plugin Order" sendet `PATCH /reorder`

## Daten & Konzepte

| Begriff     | Bedeutung                                                      |
| ----------- | -------------------------------------------------------------- |
| Plugin      | Ein Microfrontend mit Federation Entry & Icon                  |
| VersionCode | Numerischer Zähler für Sortierung / Historie                   |
| Gruppe      | UI Gruppierung (String / Id)                                   |
| Reorder     | Änderung der Reihenfolge & Gruppenzuordnung in einer Operation |
| Lizenz      | Realm Rolle aus Keycloak → Zugriff / Admin                     |

### Upload Felder (Form)

| Feld           | Beschreibung                                             |
| -------------- | -------------------------------------------------------- |
| `DisplayName`  | Anzeigename im UI                                        |
| `Description`  | Optionale Beschreibung                                   |
| `PluginName`   | Interner eindeutiger Name (ohne Leerzeichen)             |
| `Module`       | Gewähltes Einstieg-Modul (aus remoteEntry Map)           |
| `Version`      | Menschlich lesbare Version (SemVer)                      |
| `VersionCode`  | Fortlaufender int (automatisch +1 bei Update)            |
| `Route`        | Basis-Route zur Einbindung                               |
| `IconFilename` | Name der Icon Datei (wird aus Upload übernommen)         |
| `GroupId`      | Zugehörige Gruppe                                        |
| `Files[]`      | Liste aller hochgeladenen Dateien inkl. `remoteEntry.js` |

### Best Practices beim Erstellen des Plugin Bundles

| Thema               | Empfehlung                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Federation Name     | Entspricht später `PluginName` (konsistent halten)                                                |
| Exposes Key         | Präfix `./` verwenden (z.B. `./App`); im Manager ohne Präfix auswählbar                           |
| Shared Dependencies | Mindestens `react`, `react-dom`, `react-router-dom`; weitere nur wenn wirklich mehrfach vorhanden |
| Build Target        | `esnext` (wie Host) für kompatibles Modul-Format                                                  |
| Minify              | Für Debug deaktiviert, produktiv erlaubt; Fehleranalyse erleichtern                               |
| Icon                | SVG bevorzugt (klein, skalierbar)                                                                 |
| Routing             | Keine eigene BrowserRouter Instanz im finalen Export; nur `Routes`-Definition                     |
| Dateiumfang         | Nur benötigte Assets hochladen – große ungenutzte Bundles vermeiden                               |

### Automatische Modul-Erkennung

Aus `remoteEntry.js` wird via Regex & Auswertung (`moduleMap`) die Liste der Exports extrahiert und in Schritt 3 zur Auswahl angeboten. Präfix `./` wird entfernt.

Beispiel Ausschnitt aus `remoteEntry.js` (vereinfachte Darstellung):

```js
let moduleMap = { "./App": () => import("./App-XYZ.js") };
```

Der Manager parst den Objekt-Key (`./App`) und bietet `App` zur Auswahl.

### Häufige Stolpersteine beim Upload

| Problem                 | Ursache                                | Abhilfe                                                        |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------- |
| Exposed Modul fehlt     | Falscher Key in `vite.config.ts`       | Key exakt wie im Build prüfen                                  |
| Leere Modulliste        | Regex nicht gefunden                   | Build prüfen: `let moduleMap =` vorhanden?                     |
| Fehlerhafte Icons       | Falsches Format / zu groß              | SVG oder kleines PNG verwenden                                 |
| Route leitet falsch     | Relative Links im Plugin               | Absolute Pfade oder Nutzung `Link` ohne führenden Doppel-Slash |
| VersionCode nicht höher | Manuelle Änderung überschreibt Auto +1 | Felder vor Finalisierung prüfen                                |

## API Nutzung (vom Manager Client)

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

## Berechtigungen

- Admin-Rolle notwendig für Upload, Delete, Gruppen-Operationen, Reorder.
- Lesen (Liste) ebenfalls Authenticated (Rollen für Lizenzfilter). Rein UI-seitig erfolgt Filter indem nur Daten vom Host geladen werden.

## Häufige Fehler & Hinweise

| Problem                      | Ursache                            | Lösung                                       |
| ---------------------------- | ---------------------------------- | -------------------------------------------- |
| `remoteEntry.js` fehlt       | Datei nicht hochgeladen            | Datei ergänzen & erneut hochladen            |
| Keine Module erkannt         | Regex schlägt fehl / Format anders | `remoteEntry.js` prüfen (build korrekt?)     |
| VersionCode Konflikt         | Nicht inkrementiert                | Felder prüfen – Manager setzt +1 automatisch |
| 403 bei Upload               | Admin/Lizenz fehlt                 | Keycloak Rolle zuweisen                      |
| Reihenfolge nicht übernommen | PATCH fehlgeschlagen               | Konsolen-Log prüfen / PluginIds korrekt?     |

## Nutzungstipps

- Vor Upload lokale Prüfung der Federation (`remoteEntry.js` öffnen, moduleMap vorhanden?)
- Eindeutige `PluginName` wählen (stabil, klein, kein Leerzeichen)
- VersionCode nur numerisch fortführen, Version (SemVer) kann Branch-Info enthalten
- Gruppen sparsam verwenden für klare Struktur
- Bei Routen immer das Mount-Präfix gedanklich voranstellen (z.B. `/mein-plugin/details`)
- Snackbar des Host nutzen für konsistentes Feedback: `useSnackbar()(msg,'success')`
- Standalone Testing mit eigener `BrowserRouter`-Kapsel (`/mein-plugin/*`)

## Environment Variablen (Client)

| Variable                  | Zweck                                         |
| ------------------------- | --------------------------------------------- |
| `VITE_API_URL`            | Basis-URL zum Plugin Host (verschiedene Envs) |
| `VITE_KEYCLOAK_AUTHORITY` | Keycloak Realm URL (devlocal)                 |
| `VITE_KEYCLOAK_CLIENT_ID` | Frontend Client Id (devlocal)                 |

Environments: `.env.devlocal`, `.env.development`, `.env.test`, `.env.production` – nur URL/Keycloak Werte variieren.

## Grenzen (Ist-Zustand)

- Keine Validierung der Dateiinhalte außer Vorhandensein von `remoteEntry.js`
- Modul-Erkennung basiert auf nicht-robustem Regex + `eval` → potentielle Fehler bei Formatänderungen
- Kein Bulk-Upload mehrerer Versionen gleichzeitig
- Keine Rollback-Funktion (ältere Version aktivieren nur manuell durch Löschung neuerer)

## Für Entwickler (Kurz)

<details>
<summary>Technische Übersicht</summary>

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

### Modul-Extraktion (Kurz)

```ts
const moduleMapMatch = fileContent.match(/let moduleMap = ({[\s\S]*?});/);
const moduleMap = eval(`(${moduleMapMatch[1]})`);
Object.keys(moduleMap).map((k) => k.replace("./", ""));
```

### Sicherheit

- Auth via Keycloak (Rollen → Admin / Lizenz)
- Keine zusätzliche Token-Exchange für Manager UI selbst

### Styling / UI

- Material UI Komponenten (Stepper, Buttons, Progress)
- Snackbar aus Host (`host/useSnackbar`) für Feedback

</details>

## Glossar

| Begriff        | Erklärung                                            |
| -------------- | ---------------------------------------------------- |
| Reorder        | Neuordnung + Gruppenwechsel in einer PATCH Operation |
| remoteEntry.js | Federation Entry Datei eines Plugins                 |
| VersionCode    | Numerische Versionsfolge                             |
| Module         | Exportierter Einstiegspunkt des Plugin Bundles       |
| PluginGroup    | Logische UI Gruppierung                              |

## FAQ

**Warum verschwindet eine Gruppe nach Löschen?** – Plugins fallen zurück auf Default (leerer Gruppenbezeichner), Gruppe selbst entfernt.

**Wie erkenne ich das richtige Modul?** – Schritt 3 zeigt extrahierte Exports aus `remoteEntry.js`; meist der Haupteinstieg ist der größte oder namensgebende.

**Kann ich ein Icon später ändern?** – Ja, neue Version hochladen mit neuem Icon; alte bleibt historisch.

**Warum nutze ich VersionCode UND Version?** – `VersionCode` für eindeutige Sortierung, `Version` für lesbare SemVer.

**Ist eval bei Modul-Erkennung sicher?** – Nur auf hochgeladenem `remoteEntry.js` angewendet; derzeit kein alternatives Parsing implementiert.
