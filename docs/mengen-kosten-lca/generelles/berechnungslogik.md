---
title: Berechnungslogik
sidebar_label: Berechnungslogik
description: Erklärung der Berechnungsmethoden für Mengen, Kosten und Umweltauswirkungen
---

# Berechnungslogik

Dieses Dokument erklärt, wie das NHMzh-System Mengen, Kosten und Umweltauswirkungen berechnet. Die Beschreibungen sind so gehalten, dass sie sowohl für Anwender als auch Entwickler verständlich sind.

## 1. Materialvolumen-Berechnung (QTO)

Das System berechnet Materialvolumen aus den Gesamtvolumen der Bauteile und den Materialanteilen.

### Grundformel

```
Materialvolumen = Gesamtvolumen × Materialanteil
```

### Gesamtvolumen

Das System verwendet für jedes Bauteil:
- **Priorität 1**: `NetVolume` (Netto-Volumen)
- **Priorität 2**: `GrossVolume` (Brutto-Volumen)

### Materialanteil-Bestimmung

Der Materialanteil wird auf drei verschiedene Arten bestimmt:

#### 1. Explizite Fraction-Werte (IfcMaterialConstituentSet)

Wenn Materialien mit expliziten Anteilen modelliert sind, werden diese direkt verwendet:

```
Materialanteil = Fraction-Wert aus IFC
```

**Beispiel:**
- Beton: Fraction = 0.85
- Bewehrung: Fraction = 0.15

#### 2. Schichtdicken-basiert (IfcMaterialLayerSet)

Bei Schichtaufbauten wird der Anteil aus den Schichtdicken berechnet:

```
Materialanteil = Schichtdicke / Gesamtdicke aller Schichten
```

**Beispiel:**
- Gesamtdicke Wand: 274.5 mm
- Gipskarton: 12.5 mm → Anteil = 12.5 / 274.5 = 0.046
- Dämmung: 240 mm → Anteil = 240 / 274.5 = 0.875
- Holzschalung: 22 mm → Anteil = 22 / 274.5 = 0.080

#### 3. Gleichverteilung (Fallback)

Wenn keine Anteile oder Dicken verfügbar sind, werden alle Materialien gleichmässig verteilt:

```
Materialanteil = 1 / Anzahl Materialien
```

**Beispiel:**
- 3 Materialien ohne Anteile → jedes Material erhält 33.3%

### Vollständiges Beispiel

**Wand mit Gesamtvolumen:**
- Gesamtvolumen: 47.8 m³
- Schichtaufbau:
  - Gipskarton: 12.5 mm
  - Dämmung: 240 mm
  - Holzschalung: 22 mm
- Gesamtdicke: 274.5 mm

**Berechnung:**
- Gipskarton: 47.8 m³ × (12.5 / 274.5) = 2.18 m³
- Dämmung: 47.8 m³ × (240 / 274.5) = 41.8 m³
- Holzschalung: 47.8 m³ × (22 / 274.5) = 3.82 m³

## 2. Kostenberechnung

### Grundformel

```
Elementkosten = Menge × Kostenkennwert (CHF/Einheit)
```

**Einheiten:**
- Flächenbasierte Elemente: CHF/m²
- Längenbasierte Elemente: CHF/m
- Volumenbasierte Elemente: CHF/m³

### eBKP-Matching

Das System sucht für jedes Bauteil den passenden Kostenkennwert über den eBKP-Code:

#### 1. Exakte Übereinstimmung

Zuerst wird nach einer exakten Übereinstimmung gesucht:
- Bauteil: `C2.01` → Suche nach Kennwert für `C2.01`

#### 2. Hierarchische Zuordnung

Wenn keine exakte Übereinstimmung gefunden wird, wird die Hierarchie nach oben durchsucht:
- Bauteil: `C2.01` → Suche nach `C2.01`, dann `C2`, dann `C`

**Beispiel:**
- Bauteil hat eBKP-Code: `C2.01`
- Verfügbare Kennwerte:
  - `C2`: 450 CHF/m²
  - `C2.01`: nicht vorhanden
- Ergebnis: Verwendung von `C2` = 450 CHF/m²

### Berechnungsbeispiel

**Bauteil:**
- Typ: Aussenwand
- Menge: 125.5 m²
- eBKP-Code: `C2.01`
- Kostenkennwert: 450 CHF/m²

**Berechnung:**
```
Gesamtkosten = 125.5 m² × 450 CHF/m² = 56,475 CHF
```

## 3. Umweltauswirkungen-Berechnung (LCA)

Das System berechnet drei Umweltindikatoren basierend auf Materialvolumen und KBOB-Ökokennwerten. Die Berechnung folgt der Methodik gemäss **SIA 2032** und **SIA 390/1**. Alle Materialdaten stammen aus **KBOB Ökobilanzdaten im Baubereich**.

### Grundformel

```
Umweltauswirkung = Materialvolumen (m³) × Dichte (kg/m³) × KBOB Ökoindikator
```

Oder vereinfacht:

```
Umweltauswirkung = Materialmasse (kg) × KBOB Ökoindikator
```

### Berechnete Indikatoren

| Indikator | Einheit (absolut) | Bedeutung |
|-----------|-------------------|-----------|
| **GWP** (Global Warming Potential) | kg CO₂-eq | Treibhausgasemissionen |
| **UBP** (Umweltbelastungspunkte) | UBP | Gesamtumweltbelastung |
| **PENR** (Primärenergie nicht erneuerbar) | kWh | Verbrauch nicht erneuerbarer Energie |

### Berechnungsbeispiel

**Material:**
- Name: Beton C30/37
- Volumen: 45.2 m³
- Dichte: 2,400 kg/m³
- KBOB-Kennwerte:
  - GWP: 0.3 kg CO₂-eq/kg
  - UBP: 10 UBP/kg
  - PENR: 0.5 kWh/kg

**Berechnung:**
1. Masse: 45.2 m³ × 2,400 kg/m³ = 108,480 kg
2. GWP: 108,480 kg × 0.3 kg CO₂-eq/kg = 32,544 kg CO₂-eq
3. UBP: 108,480 kg × 10 UBP/kg = 1,084,800 UBP
4. PENR: 108,480 kg × 0.5 kWh/kg = 54,240 kWh

## 4. Amortisationsberechnung

Für die Berechnung relativer Umweltauswirkungen werden Bauteile mit Amortisationsdauern versehen. Die Zuordnung erfolgt gemäss **SIA 2032, Anhang D**.

### eBKP-basierte Zuordnung

Die Amortisationsdauer wird basierend auf dem eBKP-Code zugeordnet:

| Kategorie | eBKP-Codes | Amortisationsdauer |
|-----------|-----------|-------------------|
| **Tragkonstruktion** | C01, C02.01, C02.02, C03, C04.01, C04.04, C04.05, B06, B07, E01 | 60 Jahre |
| **Fassadenbekleidung** | C04.08, E02.03, E02.04, E02.05, F01.03 | 40 Jahre |
| **Ausbau und Technik** | D01-D08, E02.01, E02.02, E03, F01.02, F02, G01-G04 | 30 Jahre |
| **Spezielle Technik** | D05.02 | 20 Jahre |

**Fallback:** Wenn kein passender Code gefunden wird, wird standardmässig 30 Jahre verwendet.

### Relative Umweltauswirkungen

Die relativen Umweltauswirkungen normalisieren die absoluten Werte auf die Amortisationsdauer und die Energiebezugsfläche:

```
Relative Umweltauswirkung = Absolute Umweltauswirkung / (Amortisationsdauer × Energiebezugsfläche)
```

**Einheiten:**
- GWP relativ: kg CO₂-eq/(m²·a)
- UBP relativ: UBP/(m²·a)
- PENR relativ: kWh/(m²·a)

**Berechnungsbeispiel:**

**Gegeben:**
- Absolute GWP: 32,544 kg CO₂-eq
- Amortisationsdauer: 60 Jahre
- Energiebezugsfläche: 500 m²

**Berechnung:**
```
Relative GWP = 32,544 kg CO₂-eq / (60 Jahre × 500 m²)
             = 32,544 / 30,000
             = 1.085 kg CO₂-eq/(m²·a)
```

## 5. Datenqualität und Validierung

### Automatische Prüfungen

Das System führt automatische Validierungen durch:

#### QTO-Validierung
- Vollständigkeit der Mengenangaben
- Konsistenz: NetVolume ≤ GrossVolume
- Vorhandensein von Materialinformationen

#### Kostenvalidierung
- Negative Kosten werden auf 0 gesetzt
- Fehlende Mengen führen zum Überspringen des Elements
- Ungültige eBKP-Codes nutzen Fallback-Hierarchie

#### LCA-Validierung
- Materialvolumen-Anteile zwischen 0 und 1
- Fehlende Gesamtvolumen führen zu Warnung (nicht Fehler)
- Materialien ohne Volumenangabe erhalten Volume = 0

### Datenbereinigung

**Materialvolumen:**
- Ungültige Anteile (< 0 oder > 1) werden normalisiert
- Summe aller Anteile wird auf 100% korrigiert falls nötig

**Kostenberechnung:**
- Negative Kostenwerte werden auf 0 gesetzt
- Elemente ohne Mengenangaben werden übersprungen

**LCA-Berechnung:**
- Materialien ohne KBOB-Zuordnung erhalten Null-Werte (keine Fehler)
- Unplausible Dichten werden durch Standardwerte ersetzt

