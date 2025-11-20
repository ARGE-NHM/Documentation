---
title: Plugin Entwicklung
description: Erstellung, Aufbau, Routing, Federation und Upload eines Microfrontend Plugins für die Plattform
sidebar_position: 8
slug: /infrastructure-team/plugin-development
tags: [plugin, development, microfrontend, federation]
---

# Plugin Entwicklung für die Plattform

**Ziel**: Dieses Dokument zeigt, wie ein neues Microfrontend ("Plugin") erstellt, gebaut, getestet und über den Plugin Manager in die Plattform integriert wird. Es ergänzt die rein administrative Sicht des Plugin Manager und die Infrastruktur-Sicht des Plugin Host.

## Voraussetzungen

- Node.js (getestet mit v22.11.0)
- React + TypeScript Grundkenntnisse
- Zugriff auf Plugin Manager (Admin Rolle)
- Federated Architektur (Plugin Host stellt Lade-Infrastruktur bereit)

Empfohlene Package-Versionen:

```json
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-router-dom": "^7.1.0",
"@originjs/vite-plugin-federation": "^1.3.6",
"vite": "^6.0.1"
```

## Projekt Initialisierung

```bash
npm create vite@latest my-plugin -- --template react-ts
cd my-plugin
npm install
npm install @originjs/vite-plugin-federation --save-dev
npm install react-router-dom
```

## Module Federation Konfiguration

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "mein-plugin", // eindeutiger Federation Name = PluginName
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/App.tsx" },
      shared: ["react", "react-dom", "react-router-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
  },
});
```

Wichtig:

- `name` muss eindeutig & stabil (kebab-case) → wird als PluginName genutzt
- `exposes` enthält Einstiegsmodul(e); häufig nur `./App`
- `shared` reduziert doppelte React / Router Instanzen

## Routing

Der Host stellt einen globalen `BrowserRouter`. Dein Plugin definiert nur seine internen Unter-Routen.

`src/App.tsx`:

```tsx
import { Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import Details from "./pages/Details";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Overview />} />
      <Route path="/details" element={<Details />} />
    </Routes>
  );
}
```

### Standalone Test

Für lokales isoliertes Testen ohne Host:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";

export function StandaloneApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mein-plugin/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Build erzeugen

```bash
npm run build
```

Ergebnis: `dist/assets/remoteEntry.js` + weitere Bundles/Assets.

`remoteEntry.js` mappt deine `exposes` und wird vom Plugin Host dynamisch geladen.

## Upload über Plugin Manager

Wizard Schritte (Kurz):

1. Allgemeine Infos: DisplayName, Description, Route, Gruppe
2. Dateien: Icon + alle Build-Dateien (zwingend `remoteEntry.js`)
3. Modul auswählen (aus `exposes`) + Version (Name + Code) setzen
4. Abschluss: POST Multipart Upload
5. Optional: Reorder für Gruppen / Reihenfolge

Siehe Admin UI Dokumentation: [Plugin Manager](./plugin-manager)

## Häufige Stolpersteine

| Problem             | Ursache                      | Lösung                           |
| ------------------- | ---------------------------- | -------------------------------- |
| Modul nicht erkannt | Falscher Key in exposes      | Key prüfen (`./App`)             |
| Leere Modul-Liste   | Federation Build Format abw. | Build & `remoteEntry.js` prüfen  |
| Icon fehlt          | Nicht hochgeladen / falscher | Datei erneut hochladen           |
| Falsche Route       | Relative Links intern falsch | Absolute Pfade relativ zum Mount |

## Keycloak Rollen (Lizenzen)

- Jede Realm-Rolle entspricht einer Plugin Lizenz (Name = PluginName)
- Sichtbarkeit für Nutzer durch Gruppenmitgliedschaft mit Rolle
- Admin Operationen (Upload, Löschen, Reorder) benötigen dedizierte Admin Rolle (z.B. `plugin-manager`)

Referenz: [Keycloak Kurzreferenz](./keycloak)

## Checkliste vor Upload

- [ ] Build erzeugt (`dist/assets/remoteEntry.js` vorhanden)
- [ ] `exposes` stimmen (Entry = `./App`)
- [ ] Icon Datei optimal (SVG oder kleines PNG)
- [ ] VersionCode erhöht
- [ ] Route entspricht gewünschtem Mount (`/mein-plugin`)
- [ ] Module im Wizard korrekt erkannt

## Troubleshooting

| Symptom              | Prüfen                                         |
| -------------------- | ---------------------------------------------- |
| Plugin lädt nicht    | 404 auf remoteEntry? Pfad & Dateiname korrekt? |
| Keine Module wählbar | Inhalt remoteEntry.js → exposes vorhanden?     |
| Sichtbarkeit fehlt   | Rolle/Gruppe in Keycloak gesetzt?              |

## Weiterführend

- Infrastruktur: [Plugin Host](./plugin-host)
- Admin Pflege: [Plugin Manager](./plugin-manager)
- Auth & Rollen: [Keycloak](./keycloak)

Damit ist der Entwicklungsfluss vollständig abgedeckt.
