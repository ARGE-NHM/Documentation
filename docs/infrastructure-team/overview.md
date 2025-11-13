---
title: NHMzh Infrastructure & Core Übersicht
description: Infrastrukturmodule im NHMzh Nachhaltigkeitsmonitoring
sidebar_position: 1
---

# NHMzh Infrastructure & Core Übersicht

_Dokumentation folgt - wird von ekkodale bereitgestellt._

## Core Infrastructure

### Startseite

Zentrale Startseite des NHMzh-Systems.

### IFC Uploader Plugin

Upload und Validierung von IFC-Dateien in das NHMzh-System.

### Projekt Manager Plugin

Verwaltung von Projekten und Benutzerberechtigungen.

### Plugin Manager

Orchestrierung und Integration der verschiedenen NHMzh-Module.

## Micro-Frontend Shell

Zentrale Anwendungsschale für die Integration aller Plugins.

## Keycloak

Zentrale Identity & Access Management Plattform (Realm, Clients, Rollen, Gruppen). Integration über PluginHost.

## Infrastruktur-Komponenten (Detailseiten)

- [IFC Uploader](./ifc-uploader.md) – Validierung & Veröffentlichung von IFC Dateien
- [Homepage](./homepage.md) – Einstieg & Rollenbasierte Prozessnavigation
- [Project Manager](./project-manager.md) – Projekte, Mitglieder & Berechtigungen
- [Plugin Manager](./plugin-manager.md) – Admin UI für Upload, Versionen & Gruppen
- Micro-Frontend Shell (folgt) – Plugin Integration & Routing
- [Keycloak](./keycloak.md) – Benutzer, Rollen (Licenses), Gruppen & Token-Exchange

## Für Entwickler

Architektur, Konfiguration & Betriebsaspekte werden schrittweise ergänzt:

1. Datenflüsse (Upload → Verarbeitung → Visualisierung)
2. Messaging & Storage (Kafka, MinIO, Datenbanken)
3. CI/CD & Deployment (Stacks, Image Tags)
4. Sicherheit (Keycloak, API Keys, WebSocket Hardening)

## Nächste Schritte

Diese Seite wird erweitert sobald weitere Module dokumentiert sind (Stand: IFC Uploader verfügbar).
