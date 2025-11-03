---
title: NHMzh IFC-Modellierungsrichtlinien
sidebar_label: IFC-Modellierungsrichtlinien
description: Leitfaden zur Modellierung für das NHMzh Nachhaltigkeitsmonitoring
---

# NHMzh IFC-Modellierungsrichtlinien
## Leitfaden für Modellautoren zur optimalen IFC-Erstellung


### 1. Übersicht

Das NHMzh Nachhaltigkeitsmonitoring der Stadt Zürich analysiert IFC-Modelle automatisch zur Berechnung von Mengen, Kosten und Umweltauswirkungen. Für eine erfolgreiche Auswertung müssen IFC-Dateien bestimmte Qualitätsstandards erfüllen.

**Ziel dieses Leitfadens:**
- Vollständige Mengenermittlung aus IFC-Modellen
- Präzise Materialvolumen-Berechnung
- Korrekte eBKP-Klassifizierung
- Minimierung von manuellen Nachbearbeitungen

---

### 2. Unterstützte IFC-Klassen

Das NHMzh-System verarbeitet **25 verschiedene IFC-Klassen**. Verwenden Sie ausschliesslich diese Klassen für eine optimale Auswertung:

#### 2.1 Strukturelemente (Tragwerk)
```
✅ IfcWall                    - Wände (nicht-tragend)
✅ IfcWallStandardCase        - Wände (Standard-Konstruktion)
✅ IfcSlab                    - Decken und Bodenplatten
✅ IfcBeam                    - Balken
✅ IfcBeamStandardCase        - Balken (Standard-Konstruktion)
✅ IfcColumn                  - Stützen
✅ IfcColumnStandardCase      - Stützen (Standard-Konstruktion)
✅ IfcFooting                 - Fundamente
✅ IfcPile                    - Pfähle
✅ IfcMember                  - Weitere tragende Elemente
✅ IfcPlate                   - Platten
```

#### 2.2 Öffnungen und Fassaden
```
✅ IfcDoor                    - Türen
✅ IfcWindow                  - Fenster
✅ IfcCurtainWall             - Vorhangfassaden
```

#### 2.3 Ausbau und Oberflächen
```
✅ IfcCovering                - Oberflächenbeschichtungen
✅ IfcBuildingElementPart     - Bauteile
✅ IfcBuildingElementProxy    - Sonstige Bauteile
```

#### 2.4 Spezialelemente
```
✅ IfcRampFlight              - Rampen
✅ IfcSolarDevice             - Solaranlagen
✅ IfcEarthworksCut           - Erdarbeiten (Aushub)
✅ IfcBearing                  - Lager
✅ IfcChimney                 - Kamine
✅ IfcRailing                 - Geländer
✅ IfcReinforcingBar          - Bewehrungsstäbe
✅ IfcReinforcingElement      - Bewehrungselemente
✅ IfcReinforcingMesh         - Bewehrungsmatten
✅ IfcRoof                    - Dächer
```

**❌ Nicht unterstützte Klassen:**
Andere IFC-Klassen werden aktuell vom System ignoriert und führen zu unvollständigen Auswertungen.

---

### 3. Mengenangaben (Quantity Sets)

Das System extrahiert spezifische Mengen basierend auf standardisierten IFC Quantity Sets. **Alle Bauteile müssen vollständige Mengenangaben enthalten.**

#### 3.1 Flächenmengen (m²)

**Wände:**
```
Quantity Set: Qto_WallBaseQuantities
Erforderlich: GrossSideArea (Brutto-Seitenfläche in m²)
```

**Decken und Platten:**
```
Quantity Set: Qto_SlabBaseQuantities / Qto_PlateBaseQuantities
Erforderlich: GrossArea (Brutto-Fläche in m²)
```

**Türen und Fenster:**
```
Quantity Set: Qto_DoorBaseQuantities / Qto_WindowBaseQuantities
Erforderlich: Area (Fläche in m²)
```

**Vorhangfassaden:**
```
Quantity Set: Qto_CurtainWallBaseQuantities
Erforderlich: GrossSideArea (Brutto-Seitenfläche in m²)
```

**Oberflächenbeschichtungen:**
```
Quantity Set: Qto_CoveringBaseQuantities
Erforderlich: GrossArea (Brutto-Fläche in m²)
```

#### 3.2 Längenmengen (m)

**Balken und Stützen:**
```
Quantity Set: Qto_BeamBaseQuantities / Qto_ColumnBaseQuantities
Erforderlich: Length (Länge in m)
```

**Bewehrung:**
```
Quantity Set: Qto_ReinforcingBaseQuantities
Erforderlich: Length (Länge in m)
```

**Geländer:**
```
Quantity Set: Qto_RailingBaseQuantities
Erforderlich: Length (Länge in m)
```

#### 3.3 Oberflächenmengen (m²)

**Pfähle und Tiefgründungen:**
```
Quantity Set: Qto_PileBaseQuantities
Erforderlich: GrossSurfaceArea (Brutto-Oberfläche in m²)
```

#### 3.4 Volumenangaben (m³)

**Alle Bauteile benötigen Volumenangaben für die Materialberechnung:**
```
Priorität 1: NetVolume (Netto-Volumen)
Priorität 2: GrossVolume (Brutto-Volumen)
```

**Beispiel korrekte Quantity-Modellierung:**
```
IfcWall "Aussenwand Holz 470mm"
├── Qto_WallBaseQuantities
│   ├── GrossSideArea: 125.5 m²
│   ├── NetVolume: 45.2 m³
│   └── GrossVolume: 47.8 m³
```

---

### 4. Materialmodellierung

Die Materialmodellierung ist **kritisch** für die Umweltauswirkungsberechnung. Das System berechnet Materialvolumen basierend auf Gesamtvolumen und Materialanteilen.

#### 4.1 Materialzuordnung

**Jedes Bauteil muss Materialinformationen enthalten:**

**Einzelmaterialien:**
```
IfcMaterial
├── Name: "Beton C30/37"
├── Description: "Konstruktionsbeton"
```

**Schichtaufbauten (empfohlen):**
```
IfcMaterialLayerSet
├── MaterialLayers[0]
│   ├── Material: "Gipskartonplatte"
│   ├── LayerThickness: 12.5 mm
├── MaterialLayers[1]
│   ├── Material: "Holzfaserdämmung"
│   ├── LayerThickness: 240 mm
├── MaterialLayers[2]
│   ├── Material: "Holzschalung"
│   ├── LayerThickness: 22 mm
```

**Materialzusammensetzungen:**
```
IfcMaterialConstituentSet
├── MaterialConstituents[0]
│   ├── Material: "Zement"
│   ├── Fraction: 0.15
├── MaterialConstituents[1]
│   ├── Material: "Kies"
│   ├── Fraction: 0.85
```

#### 4.2 Materialbezeichnungen

**✅ Korrekte Materialbezeichnungen:**
- Spezifisch und eindeutig
- Orientierung an KBOB-Datenbank
- Deutsche Bezeichnungen bevorzugt

```
✅ "Beton C30/37"
✅ "Holzfaserdämmung λ=0.038"
✅ "Gipskartonplatte 12.5mm"
✅ "Stahlbeton C30/37"
```

**❌ Ungeeignete Materialbezeichnungen:**
```
❌ "Default"
❌ "Material_01"
❌ "Concrete"
❌ "Wood"
❌ Leere Materialbezeichnungen
```

#### 4.3 Materialvolumen-Berechnung

**Das System berechnet automatisch:**
```
Materialvolumen = Gesamtvolumen × Materialanteil
```

**Materialanteile werden bestimmt durch:**
1. **Explizite Fraction-Werte** in IfcMaterialConstituentSet
2. **Schichtdicken** in IfcMaterialLayerSet (Dicke/Gesamtdicke)
3. **Gleichverteilung** bei fehlenden Angaben

**Beispiel Volumenberechnung:**
```
Wand: Gesamtvolumen = 47.8 m³
├── Gipskarton (12.5mm): 47.8 × (12.5/274.5) = 2.18 m³
├── Dämmung (240mm): 47.8 × (240/274.5) = 41.8 m³
└── Holzschalung (22mm): 47.8 × (22/274.5) = 3.82 m³
```

---

### 5. eBKP-Klassifizierung

Jedes Bauteil muss eine **korrekte eBKP-Klassifizierung** für die Kostenberechnung enthalten.

#### 5.1 eBKP-Zuordnung

**Klassifizierung über IfcClassificationReference:**
```
IfcRelAssociatesClassification
├── RelatingClassification: IfcClassificationReference
│   ├── Identification: "C2.01"
│   ├── Name: "Aussenwandkonstruktion"
│   └── ReferencedSource: IfcClassification
│       └── Name: "eBKP"
```

**Alternative über Properties:**
```
IfcPropertySet "Classification"
├── IfcPropertySingleValue
│   ├── Name: "eBKP_Code"
│   └── NominalValue: "C2.01"
```

#### 5.2 Wichtige eBKP-Codes

**Tragwerk (60 Jahre Amortisation):**
```
C01.01 - Unterbau Fundament und Bodenplatte
C01.02 - Fundament
C01.03 - Bodenplatte
C02.01 - Aussenwandkonstruktion
C02.02 - Innenwandkonstruktion
C03.01 - Aussenstütze
C03.02 - Innenstütze
C04.01 - Geschossdecke
C04.04 - Konstruktion Flachdach
C04.05 - Konstruktion geneigtes Dach
```

**Gebäudetechnik (30 Jahre Amortisation):**
```
D01.01-D01.11 - Elektroinstallationen
D05.02 - Wärmeerzeugung
D05.04 - Wärmeverteilung
D05.05 - Wärmeabgabe
D07.01-D07.05 - Lüftungsanlagen
D08.01-D08.06 - Sanitärinstallationen
```

**Fassade (30-40 Jahre Amortisation):**
```
E02.01 - Äussere Beschichtung (30 Jahre)
E02.02 - Aussenwärmedämmsystem (30 Jahre)
E02.03 - Fassadenbekleidung (40 Jahre)
E03.01 - Fenster (30 Jahre)
E03.02 - Aussentür (30 Jahre)
```

**Innenausbau (30 Jahre Amortisation):**
```
G01.01 - Fest stehende Trennwand
G02.02 - Bodenbelag
G03.02 - Wandbekleidung
G04.02 - Deckenbekleidung
```

---

### 6. Qualitätskontrolle

#### 6.1 Automatische Validierung

Das System prüft automatisch:
- Vollständigkeit der Materialangaben
- Gültigkeit der Mengenangaben
- Konsistenz der Volumenberechnungen
- Plausibilität der eBKP-Zuordnungen

#### 6.2 IFC-Schema Kompatibilität

**Unterstützte Schemas:**
- ✅ IFC2X3
- ✅ IFC4

**Export-Einstellungen:**
- Mengen: Quantity Sets exportieren
- Klassifizierung: eBKP als IfcClassificationReference

---

### 7. Häufige Fehler vermeiden

#### 7.1 Kritische Fehler

**❌ Fehlende Quantity Sets**
```
Problem: Bauteil ohne Mengenangaben
Folge: Element wird nicht in Kostenberechnung berücksichtigt
Lösung: Quantity Sets für alle Bauteile definieren
```

**❌ Leere Materialbezeichnungen**
```
Problem: Material = "Default" oder leer
Folge: Keine Umweltauswirkungsberechnung möglich
Lösung: Spezifische Materialbezeichnungen verwenden
```

**❌ Fehlende eBKP-Klassifizierung**
```
Problem: Kein eBKP-Code zugeordnet
Folge: Manuelle Nachbearbeitung erforderlich
Lösung: Systematische eBKP-Zuordnung
```

**❌ Inkonsistente Volumenangaben**
```
Problem: NetVolume > GrossVolume
Folge: Fehlerhafte Materialvolumen-Berechnung
Lösung: Plausibilitätsprüfung der Volumen
```

#### 7.2 Best-Practice

**✅ Detaillierte Schichtaufbauten**
```
Vorteil: Präzise Materialvolumen-Berechnung
Empfehlung: IfcMaterialLayerSet mit exakten Dicken
```

**✅ Konsistente Benennung**
```
Vorteil: Bessere automatische KBOB-Zuordnung
Empfehlung: Standardisierte Materialbezeichnungen
```

**✅ Hierarchische eBKP-Codes**
```
Vorteil: Flexibilität bei Kostenzuordnung
Empfehlung: Detaillierte Codes (z.B. C2.01 statt C2)
```

**Generelle Tipps**:
- Regelmässige Testexporte mit kleinen Modellteilen
- Iterative Verbesserung basierend auf System-Feedback
- Dokumentation projektspezifischer Modellierungsstandards
---

### 8. Prüfliste

#### 8.1 Vor Export

**Modellstruktur:**
- [ ] Alle Bauteile verwenden unterstützte IFC-Klassen
- [ ] Räumliche Zuordnung zu IfcBuildingStorey
- [ ] Eindeutige GlobalId für alle Elemente

**Mengenangaben:**
- [ ] Quantity Sets für alle Bauteile vorhanden
- [ ] Flächenangaben in m² (für flächenbasierte Elemente)
- [ ] Längenangaben in m (für lineare Elemente)
- [ ] Volumenangaben in m³ (NetVolume oder GrossVolume)
- [ ] Mengenangaben sind plausibel (> 0)

**Materialmodellierung:**
- [ ] Alle Bauteile haben Materialzuordnungen
- [ ] Materialbezeichnungen sind spezifisch und aussagekräftig
- [ ] Schichtaufbauten mit korrekten Dickenangaben
- [ ] Materialanteile summieren sich zu 100%

**eBKP-Klassifizierung:**
- [ ] Alle Bauteile haben eBKP-Codes
- [ ] eBKP-Codes entsprechen Bauteiltyp
- [ ] Klassifizierungsreferenzen sind korrekt in IFC exportiert

#### 8.2 Nach Export

**IFC-Datei Validierung:**
- [ ] IFC-Datei öffnet ohne Fehler in Viewer
- [ ] Alle Bauteile sind sichtbar
- [ ] Materialinformationen sind vollständig
- [ ] Property Sets sind exportiert

**Test-Import im NHMzh-System:**
- [ ] Alle Bauteile werden erkannt
- [ ] Mengenangaben werden korrekt extrahiert
- [ ] Materialvolumen werden berechnet
- [ ] eBKP-Zuordnungen funktionieren

