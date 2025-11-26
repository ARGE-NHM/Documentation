---
title: IFC Uploader
description: Architektur, Ablauf und Betrieb des IFC Uploaders im NHMzh Core
sidebar_position: 4
slug: /infrastructure-team/ifc-uploader
tags: [ifc, upload, validation, infrastructure]
---

# IFC Uploader Plugin

**Qualitätssicherung & Freigabe von IFC-Modellen** – Dieses Plugin überprüft hochgeladene IFC-Dateien automatisch gegen IDS-Spezifikationen und macht gültige Modelle für die nachgelagerten Schritte (Mengenermittlung, Kosten, Ökobilanzierung, Visualisierung) verfügbar.

[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MinIO](https://img.shields.io/badge/MinIO-ED2674.svg?style=for-the-badge&logo=minio&logoColor=white)](https://min.io/)
[![Kafka](https://img.shields.io/badge/Kafka-000000.svg?style=for-the-badge&logo=apache-kafka&logoColor=white)](https://kafka.apache.org/)

## Was macht das Plugin?

- Nimmt IFC-Datei entgegen (Drag & Drop)
- Prüft Inhalte gegen hinterlegte IDS-Dateien (Qualitätsanforderungen)
- Erstellt Validierungsreports (HTML & optional BCF)
- Ermöglicht Veröffentlichung (Freigabe) erfolgreicher Dateien
- Sendet Ereignis an die Verarbeitungspipeline (Kafka)

## Schnelleinstieg

:::tip Schnellstart
Die wichtigsten Schritte zum erfolgreichen Upload sind unten kompakt dargestellt. Bei Validierungsfehlern zuerst den HTML Report prüfen – er ist detaillierter als BCF.
:::

1. Projekt auswählen (Dropdown)
2. IFC-Datei in Dropzone ziehen oder wählen
3. Prüfung abwarten – Ampel-/Statusmeldungen beobachten
4. Bei Fehlern: Reports öffnen (HTML im neuen Tab, BCF herunterladen) → Modell korrigieren → Neu hochladen
5. Bei Erfolg: "Freigeben" klicken → Modell steht nachgelagerten Plugins zur Verfügung
6. Liste veröffentlichter IFC-Dateien prüfen

## Validierungsfeedback

Der Fortschritt wird live per WebSocket angezeigt:

- Schritt 1: Upload
- Schritt 2..N: IDS-Datei X – Ergebnis (valid / invalid)
- Abschluss: Erfolgsmeldung oder Fehlerhinweise

## Reporting

- HTML Report: Übersicht pro IDS (erfüllte / fehlende Anforderungen)
- BCF Report: Nur bei Fehlern – strukturiertes Austauschformat
- Speicherdauer der presigned Links: 7 Tage

## Häufige Fehler & Hinweise

| Problem                | Ursache                                  | Lösung                                          |
| ---------------------- | ---------------------------------------- | ----------------------------------------------- |
| "No IDS files exist"   | Filter liefert keine Treffer             | Trades/Phasen prüfen oder IDS hochladen         |
| IFC Parsing Fehler     | Ungültige / beschädigte IFC Datei        | IFC Modell im Viewer prüfen, neu exportieren    |
| Leere Prüfungen        | Datei enthält keine relevanten Entitäten | Modellierungsrichtlinien beachten               |
| Keine Freigabe möglich | Validierung fehlgeschlagen               | HTML/BCF Report analysieren, Modell korrigieren |

Siehe auch: [IFC-Modellierungsrichtlinien](../mengen-kosten-lca/generelles/ifc-guidelines) für optimale Vorbereitung.

## Weiterführende Nutzung

Nach Freigabe kann das Modell unmittelbar in den Fach-Plugins (QTO, Kosten, LCA, Dashboard) verarbeitet werden.

## Für Entwickler

:::note
Dieser Abschnitt ist nur für Entwickler relevant – Anwender können ihn ausklappen, müssen aber nichts davon kennen.
:::

<details>
<summary>Technische Übersicht</summary>

### Datenfluss

```
Client → /upload → MinIO (temp) → IDS Prüfung → Reports → /publish → MinIO (permanent) → Kafka Event
```

### Wichtige Module

- `perform_ids_check()` – orchestriert IDS Schleife
- `store_report()` – Report-Erstellung & Speicherung
- `KafkaHandler.produce_ifc_file()` – Event Erzeugung
- `ConnectionManager` – WebSocket Sessions

### Endpunkte

| Methode | Pfad              | Beschreibung                       |
| ------- | ----------------- | ---------------------------------- |
| POST    | `/upload/`        | Datei hochladen & prüfen           |
| POST    | `/publish/`       | Datei freigeben                    |
| GET     | `/files/`         | Liste freigegebener Modelle        |
| GET     | `/ids-files/`     | IDS Dateien gebündelt (ZIP Base64) |
| WS      | `/ws/{client_id}` | Live Status                        |

### Env Variablen (Auszug)

| Variable                  | Funktion                    |
| ------------------------- | --------------------------- |
| `MINIO_ENDPOINT`          | MinIO Host                  |
| `MINIO_URL`               | Basis für presigned Anzeige |
| `KAFKA_BOOTSTRAP_SERVERS` | Broker Adresse              |
| `IFC_BUCKET_NAME`         | Permanenter Bucket          |
| `IFC_TEMP_BUCKET_NAME`    | Temporärer Bucket           |
| `IDS_BUCKET_NAME`         | IDS Dateien                 |
| `REPORT_BUCKET_NAME`      | Reports                     |

### Projekt-Datensatz

| Feld           | Beschreibung             |
| -------------- | ------------------------ |
| `project_code` | Eindeutiger Schlüssel    |
| `name`         | Anzeigename              |
| `phase_id`     | Optionaler Projektstatus |
| `power_bi_url` | Verlinktes Dashboard     |

### Systemkomponenten (Übersicht)

| Komponente      | Zweck                                                          |
| --------------- | -------------------------------------------------------------- |
| Upload UI       | Dateiannahme & Statusanzeige                                   |
| FastAPI Service | Validierung, MinIO & Kafka Integration                         |
| MinIO Buckets   | Temporäre & permanente Ablage, Reports, IDS                    |
| Kafka Event     | Signal an Verarbeitungskette (Thema: IFC-Datei veröffentlicht) |
| Postgres        | Projekt-Stammdaten                                             |

### Buckets

| Bucket         | Beschreibung                  |
| -------------- | ----------------------------- |
| `ifc-temp`     | Zwischenspeicher bis Freigabe |
| `ifc-files`    | Freigegebene Modelle          |
| `ids-files`    | IDS Spezifikationen           |
| `report-files` | HTML / BCF Reports            |

### Topics

| Topic                                    | Zweck                                                                      | EventName Werte (Header)        |
| ---------------------------------------- | -------------------------------------------------------------------------- | ------------------------------- |
| `ifc-files`                              | Veröffentlichung einer geprüften IFC-Datei (URL wird verteilt)             | –                               |
| `ekkodale.projekt.projektmanager.public` | Empfang externer Projekt-Events zur Synchronisation (create/update/delete) | `created`, `updated`, `deleted` |

</details>

## Glossar

| Begriff       | Erklärung                                        |
| ------------- | ------------------------------------------------ |
| IDS           | Ruleset zur Validierung von IFC Inhalten         |
| BCF           | Austauschformat für Modellprüfungs-Issues        |
| Kafka Event   | Nachricht zur Signalisierung eines neuen Modells |
| Presigned URL | Temporärer Link zum Objektzugriff                |

## FAQ

**Wann sollte ich eine Datei erneut hochladen?** – Nach jeder Modellrevision, insbesondere bei fehlgeschlagener IDS Validierung.

**Warum sehe ich keine IDS Dateien?** – Möglicherweise falsche Filter (Trades/Phasen) oder keine Dateien im `ids-files` Bucket.

**Kann ich mehrere Dateien gleichzeitig prüfen?** – Aktuell einzeln empfohlen für klare Reports.

**Werden alte Reports automatisch gelöscht?** – Zugriff per presigned Link läuft ab; Persistenzstrategie kann projektabhängig ergänzt werden.
