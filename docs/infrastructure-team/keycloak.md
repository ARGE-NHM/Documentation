---
title: Keycloak (Kurzreferenz Projekt & Homepage)
description: Minimale Schritte für Benutzer, Gruppen (inkl. Ordnung) und Plugin-Lizenzen (Realm-Rollen)
sidebar_position: 15
---

# Keycloak – Projektrelevante Nutzung

Diese Kurzreferenz beschreibt nur das, was für den Project Manager und die Homepage benötigt wird:

- Benutzer anlegen
- Gruppen anlegen (werden im Project Manager angezeigt)
- `order` Attribut für Gruppen zur Sortierung auf der Homepage
- Realm-Rollen (Plugin Lizenzen) erstellen und Gruppen zuordnen

## Grundkonzepte

| Begriff          | Bedeutung                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Realm-Rolle      | Steuert Sichtbarkeit/Nutzung eines Plugins (License)                                         |
| Gruppe           | Fachliche oder organisatorische Einheit; erscheint im Project Manager; kann Lizenzen bündeln |
| Benutzer         | Erhält Zugriff durch Mitgliedschaft in Gruppen (inkl. deren Rollen)                          |
| Attribut `order` | Zahl zur Reihenfolge-Darstellung einer Gruppe auf der Homepage                               |

## Ablauf: Neue Gruppe anlegen

1. Keycloak → Groups → `Create group` → Name vergeben (sprechender fachlicher Name).
2. Gruppe öffnen → Tab `Attributes` → Attribut `order` (Wert: ganze Zahl, z.B. `3`) setzen für Homepage-Sortierung (optional bei rein administrativen Gruppen).
3. Tab `Role mapping` → Unter `Realm roles` gewünschte Plugin-Rollen hinzufügen (z.B. `project-manager`, `ifc-uploader`, `plugin-manager`). Dadurch erhalten alle Mitglieder der Gruppe automatisch diese Lizenzen.
4. Speichern.

Hinweise:

- Jede Plugin-Lizenz entspricht einer Realm-Rolle mit exakt dem Plugin-Namen (kebab-case).
- Keine redundanten Gruppen für einzelne Plugins erstellen; Rollen direkt der fachlichen Gruppe zuweisen.
- `order`: Niedrige Zahl = weiter vorne. Nicht gesetzte Gruppen werden nachrangig oder (je nach Implementierung) ausgeblendet.

## Ablauf: Neue Realm-Rolle (Plugin Lizenz) anlegen

Nur nötig falls ein neues Plugin entsteht.

1. Keycloak → Realm Roles → `Create role`.
2. Name = Plugin-Federation-Name (z.B. `energy-dashboard`).
3. Speichern.
4. Rolle anschließend der passenden Gruppe zuordnen (siehe oben Schritt 3 bei Gruppen).

## Ablauf: Neuen Benutzer anlegen

1. Keycloak → Users → `Add user` (Username, optional E-Mail) → Speichern.
2. Tab `Credentials` → Initialpasswort setzen (falls nicht extern provisioniert).
3. Tab `Groups` → Benötigte fachliche Gruppen auswählen (Mitgliedschaft hinzufügen). Benutzer erbt damit automatisch deren Realm-Rollen (Plugin Lizenzen).
4. Login testen: Sichtbare Plugins entsprechen den zugeordneten Rollen über Gruppen.

Optional: Direkte Rollen-Zuweisung unter `Role Mappings` ist nur nötig, wenn ein Benutzer eine Lizenz erhalten soll ohne in einer Gruppe zu sein (selten empfohlen – bevorzugt Gruppen nutzen für Nachvollziehbarkeit).

## Pflege bestehender Gruppen

| Aufgabe            | Vorgehen                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| Reihenfolge ändern | Attribut `order` Wert anpassen (z.B. 2 → 5)                                           |
| Lizenz hinzufügen  | Gruppe → `Role mapping` → gewünschte Realm-Rolle hinzufügen                           |
| Lizenz entfernen   | Gruppe → `Role mapping` → Rolle auswählen → Entfernen                                 |
| Gruppe umbenennen  | Gruppe → `Edit` → Namen ändern (Achtung: Auswirkungen auf externe Zuordnungen prüfen) |

## Beispielwerte

| Gruppe                       | order  | Zugeordnete Rollen (Beispiel)                  |
| ---------------------------- | ------ | ---------------------------------------------- |
| `Fachplanung Kosten`         | 3      | `project-manager`, `ifc-uploader`              |
| `Projektleitung Architektur` | 5      | `project-manager`                              |
| `Ökobilanz`                  | 7      | `ifc-uploader`                                 |
| `/Admin`                     | (leer) | `plugin-manager`, weitere globale Admin-Rollen |

`/Admin` benötigt kein `order`, da primär administrativ.

## Kurze Fehleranalyse

| Symptom                         | Prüfung                                                             |
| ------------------------------- | ------------------------------------------------------------------- |
| Plugin fehlt                    | Ist die entsprechende Realm-Rolle der Benutzergruppe zugeordnet?    |
| Gruppe nicht sortiert           | Hat sie ein numerisches `order` Attribut?                           |
| Benutzer sieht zu viele Plugins | Direkte Rollen-Zuweisungen prüfen (evtl. unerwünschte Einzelrollen) |
| Benutzer sieht gar nichts       | Ist er Mitglied in mindestens einer Gruppe mit Rollen?              |

## Best Practices (Minimal)

- Rollenname = Pluginname (kebab-case, keine Leerzeichen).
- Lizenzen immer über Gruppen verteilen statt direkt pro Benutzer.
- `order` nur für fachlich sichtbare Gruppen setzen, nicht für rein technische (z.B. `/Admin`).
- Änderungen (neue Rollen / neue order-Werte) kurz im Team dokumentieren.

## Schnellreferenz

| Aktion              | Navigation                               |
| ------------------- | ---------------------------------------- |
| Gruppe anlegen      | Groups → Create group                    |
| `order` setzen      | Group → Attributes → Add `order`         |
| Lizenz zu Gruppe    | Group → Role mapping → Realm roles → Add |
| Plugin Lizenz neu   | Realm Roles → Create role                |
| Benutzer anlegen    | Users → Add user                         |
| Benutzer zu Gruppen | User → Groups → Join                     |

Damit sind alle projektrelevanten Schritte abgedeckt.
