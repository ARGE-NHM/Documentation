---
title: Übersicht
description: Übersicht über Basis-Plugins & Dienste (Upload, Projekte, Verwaltung, Auth)
sidebar_position: 1
slug: /infrastructure-team/overview
tags: [infrastructure, overview]
---

# Infrastructure & Core

Die Infrastruktur bildet das technische Fundament für alle Fach-Plugins (Mengen, Kosten, LCA, Dashboard). Sie stellt Upload, Projektkontext, Plugin-Lifecycle und Authentifizierung bereit.

## Kernmodule

| Modul                        | Zweck (Kurz)                                                   |
| ---------------------------- | -------------------------------------------------------------- |
| Homepage                     | Einstiegsseite & rollenbasierter Prozessüberblick              |
| IFC Uploader                 | IDS-Prüfung & Freigabe von IFC Dateien + Event                 |
| Project Manager              | Projektdaten & Team-Zuordnung als gemeinsamer Kontext          |
| Plugin Host                  | Listet & liefert Bundles, Token-Exchange, Gruppenverwaltung    |
| Plugin Manager               | Upload & Versionierung der Microfrontends, Reihenfolge         |
| Keycloak                     | Benutzer, Gruppen (Homepage Ordnung), Rollen = Plugin-Lizenzen |
| Micro-Frontend Shell (folgt) | Federation Mount & gemeinsame UI                               |

## Ziel & Nutzen

- Einheitlicher Projektkontext für alle Auswertungen
- Modularer Ausbau durch klare Plugin-Schnittstellen
- Sichere Authentifizierung & Lizenzprüfung via Keycloak Rollen
- Schnelles Deployment neuer UI-Versionen (Plugin Manager + Host)

## Schnelleinstieg (Benutzer)

1. Keycloak Login (Gruppe + Rollen vorhanden)
2. Homepage zeigt freigeschaltete Prozess-Schritte
3. Projekt im Project Manager anlegen / auswählen
4. IFC Datei hochladen & freigeben (IFC Uploader)
5. Weiterarbeiten in Fach-Plugins (QTO, Kosten, LCA, Dashboard)

## Rollen & Gruppen (Kurz)

| Element                            | Bedeutung                                       |
| ---------------------------------- | ----------------------------------------------- |
| Realm-Rolle (z.B. `ifc-uploader`)  | Lizenz zur Plugin-Sichtbarkeit                  |
| Gruppe (z.B. `Fachplanung Kosten`) | Bündelt Rollen + Homepage Ordnung (`order`)     |
| Gruppe `/Admin`                    | Administratives: Upload, Reorder, Gruppenpflege |

## Verweise

- [IFC Uploader](./ifc-uploader.md)
- [Homepage](./homepage.md)
- [Project Manager](./project-manager.md)
- [Plugin Host](./plugin-host.md)
- [Plugin Manager](./plugin-manager.md)
- [Plugin Entwicklung](./plugin-development.md)
- [Keycloak Kurzreferenz](./keycloak.md)

## FAQ (Kurz)

**Warum sehe ich ein Plugin nicht?** Rolle (Realm-Rolle) fehlt in einer zugeordneten Gruppe.

**Wozu das `order` Attribut?** Steuert Reihenfolge von Gruppen auf der Homepage.

**Wie lade ich ein neues Plugin?** Bundle bauen → Plugin Manager Wizard nutzen → Lizenz-Rolle in Keycloak hinzufügen.

**Benötige ich direkte Rollen am Benutzer?** Normalerweise nicht – Gruppenmitgliedschaft genügt.

## Changelog

| Datum      | Änderung                                                           |
| ---------- | ------------------------------------------------------------------ |
| 2025-11-13 | Seite komplett überarbeitet (kompakte Übersicht & vereinheitlicht) |
