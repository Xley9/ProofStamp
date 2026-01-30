# ProofStamp — Digitaler Beweis-Sicherer

## Konzept
Einfache PWA mit der man Fotos, Screenshots und Texte mit einem kryptografischen
Zeitstempel versehen kann — als Beweis, dass etwas zu einem bestimmten Zeitpunkt existiert hat.
100% lokal, keine Registrierung, Open Source.

## Das Problem
Menschen brauchen Beweise, haben aber kein einfaches Tool dafür:
- Wohnungszustand bei Einzug/Auszug dokumentieren
- Mietwagen-Zustand bei Übernahme fotografieren
- Belästigung/Betrug per Nachricht beweisen
- Online-Bestellungen die nie ankamen
- Preise die sich plötzlich ändern
- Vertragsbedingungen die sich ändern
- Social-Media-Posts die gelöscht werden
- Schäden vor/nach Reparaturen

---

## Wie funktioniert ProofStamp? (Komplett erklärt)

### Auf dem Handy (Hauptnutzung)

1. **User öffnet ProofStamp im Handy-Browser** (oder als installierte PWA auf dem Homescreen)
2. **Tippt auf "Beweis erstellen"**
3. **Handy-Kamera öffnet sich direkt** — User fotografiert z.B.:
   - Die Kratzer am Mietwagen
   - Den Zustand der Wohnung
   - Ein Paket das beschädigt ankam
   - Einen Kassenbon
4. **ProofStamp macht automatisch:**
   - Speichert das Foto lokal auf dem Gerät
   - Liest Datum + Uhrzeit aus (sekundengenau)
   - Liest GPS-Standort aus (wenn erlaubt) — beweist WO das Foto gemacht wurde
   - Erzeugt einen SHA-256 Hash (einzigartiger digitaler Fingerabdruck)
   - Speichert alles zusammen als "Beweis-Paket"
5. **User kann optional hinzufügen:**
   - Titel: "Kratzer an Fahrertür Mietwagen"
   - Beschreibung: "Bei Übernahme am 15.01.2026 bereits vorhanden"
   - Kategorie: Fahrzeug
6. **Fertig.** Der Beweis ist gesichert.

### Auf dem PC/Laptop

1. **User öffnet ProofStamp im Browser**
2. **Kann Dateien hochladen:**
   - Screenshots (von Webseiten, Chats, E-Mails)
   - PDFs (Verträge, Rechnungen)
   - Bilder von der Festplatte
3. **Gleicher Prozess:** Hash + Zeitstempel + Metadaten werden erzeugt

### Physische Welt — Reale Anwendungsbeispiele

#### Wohnung (Einzug/Auszug)
- Handy rausholen → ProofStamp öffnen → Jedes Zimmer fotografieren
- Kratzer, Flecken, Schäden dokumentieren
- GPS bestätigt: Foto wurde IN der Wohnung gemacht
- Zeitstempel bestätigt: Foto wurde AM EINZUGSTAG gemacht
- Bei Auszug: gleiche Räume nochmal fotografieren
- Vermieter kann nicht behaupten, Schäden waren vorher nicht da

#### Mietwagen
- Vor Übernahme: Auto von allen Seiten fotografieren
- Jeden Kratzer, jede Delle einzeln fotografieren
- Bei Rückgabe: nochmal fotografieren
- Autovermieter kann keine Schäden berechnen, die vorher schon da waren

#### Pakete & Lieferungen
- Paket kommt beschädigt an → sofort fotografieren
- Inhalt kaputt → fotografieren
- Beweis für Reklamation bei Amazon, DHL, etc.

#### Nachbarschaftsstreit
- Lärm-Protokoll mit Zeitstempel
- Beschädigte Gegenstände fotografieren
- Zustand des Gartens/Zauns dokumentieren

#### Arbeitsplatz
- Arbeitsplatz-Zustand dokumentieren
- Mobbing-Nachrichten screenshot + hashen
- Überstunden-Nachweis

#### Kauf & Verkauf
- Zustand eines Gebrauchtwagens VOR dem Kauf
- eBay-Artikel: Zustand beim Versand fotografieren
- Preise in Online-Shops dokumentieren (vor "Sales")

---

## Was macht den Beweis glaubwürdig?

### Der SHA-256 Hash
- Ein Hash ist wie ein digitaler Fingerabdruck
- Jede Datei erzeugt einen EINZIGARTIGEN Hash
- Wird auch nur 1 Pixel im Foto geändert → komplett anderer Hash
- Das beweist: Das Foto wurde NICHT nachträglich bearbeitet

### Der Zeitstempel
- Exaktes Datum + Uhrzeit wann der Beweis erstellt wurde
- Kann nicht nachträglich geändert werden (mit dem Hash verknüpft)

### GPS-Standort (optional)
- Beweist WO das Foto aufgenommen wurde
- Besonders wichtig bei: Wohnung, Mietwagen, Unfälle

### Beweis-PDF Export
- Ein fertiges PDF-Dokument mit:
  - Das Foto / Screenshot
  - Datum + Uhrzeit
  - GPS-Koordinaten (wenn vorhanden)
  - SHA-256 Hash
  - QR-Code (zum Verifizieren)
  - Titel + Beschreibung
- Kann ausgedruckt, per E-Mail verschickt oder gespeichert werden
- Sieht offiziell und professionell aus

### Verifizierung
- Jeder kann ein Foto + den Hash nehmen und prüfen: "Stimmt der Hash?"
- Wenn ja → Foto ist echt und unverändert
- ProofStamp hat ein eingebautes Verifizierungs-Tool

---

## Wichtig: Was ProofStamp NICHT ist
- KEIN Ersatz für notarielle Beglaubigung
- KEIN rechtlich bindender Beweis vor Gericht (das kann nur ein Notar)
- ABER: Ein starkes Indiz und Dokumentations-Tool
- Vergleichbar mit einem Foto + Tageszeitung im Bild (altbekannter Trick)
- In vielen Fällen reicht es als Beweis (Versicherung, Vermieter, Reklamation)

---

## Kernfunktionen
- Foto aufnehmen (Handy-Kamera direkt) oder Bild hochladen
- Screenshot / Text einfügen
- Automatischer SHA-256 Hash + Zeitstempel
- GPS-Standort erfassen (optional, mit Erlaubnis)
- Metadaten: Datum, Uhrzeit, Ort, Titel & Beschreibung
- Verifizierungs-Tool: Hash prüfen ob Datei unverändert ist
- Beweis-PDF exportieren (Bild + Hash + Zeitstempel + GPS + QR-Code)
- Alle Beweise in einer lokalen Galerie mit Suche & Filter
- Kategorien: Wohnung, Fahrzeug, Kauf/Bestellung, Kommunikation, Vertrag, Arbeitsplatz, Sonstiges
- Mehrere Fotos pro Beweis (z.B. 10 Fotos vom Mietwagen = 1 Beweis-Paket)

## Tech-Stack
- HTML + CSS + Vanilla JS
- PWA (offline-fähig, installierbar)
- IndexedDB (für Bilder/Dateien lokal speichern)
- Web Crypto API (SHA-256 Hashing, nativ im Browser)
- Geolocation API (GPS-Standort)
- MediaDevices API (Kamera-Zugriff auf dem Handy)
- Canvas API / jsPDF (für PDF-Export)
- GitHub Pages (kostenloses Hosting)
- MIT-Lizenz

## Sicherheitskonzept
- Hash wird aus: Datei-Inhalt + Zeitstempel + GPS + zufälliger Salt generiert
- Hash ist kryptografisch — jede kleinste Änderung ergibt einen komplett anderen Hash
- Verifizierung: Datei erneut hashen und mit gespeichertem Hash vergleichen
- Kein Server, keine Blockchain — einfach und transparent
- Alle Daten bleiben auf dem Gerät des Users

## Mehrsprachig
- DE, EN, TR, ES, FR (wie SubTracker)

## Zielgruppe
Jeder Mensch der jemals einen Beweis braucht — Mieter, Käufer, Arbeitnehmer, Eltern, Verkäufer, etc.

## GitHub
Repository: https://github.com/Xley9/ProofStamp

---

## PROJEKTSTATUS – Google Play Veröffentlichung (Stand: 30.01.2026)

### ERLEDIGT ✅
- [x] App fertig entwickelt (PWA + Capacitor Android)
- [x] Privacy Policy online: https://xley9.github.io/ProofStamp/privacy-policy.html
- [x] App-Icon 512x512 erstellt (store-assets/icon-512.png)
- [x] Feature Graphic 1024x500 erstellt (store-assets/feature-graphic.png)
- [x] Store-Listing Texte (EN + DE) fertig (store-assets/store-listing.md)
- [x] Release AAB signiert und gebaut (ProofStamp-release.aab auf Desktop)
- [x] Bug gefixt: Delete-Confirmation funktioniert jetzt (confirmCallback wurde vor Ausführung genullt)
- [x] Service Worker Cache auf v2 aktualisiert (damit Fix bei Nutzern ankommt)
- [x] Alles auf GitHub gepusht
- [x] Google Play Developer-Konto verifiziert
- [x] Google Play Console: App erstellt
- [x] Store-Eintrag ausgefüllt und gespeichert (EN, Name, Beschreibungen, Icon, Feature Graphic, 6 Screenshots)
- [x] Datenschutzerklärung URL eingetragen
- [x] App-Zugriff: Keine Einschränkungen
- [x] Werbung: Keine
- [x] Altersfreigabe: Fragebogen ausgefüllt (PEGI 3 / Everyone, Zielgruppe 13+)
- [x] Datensicherheit: Keine Daten erhoben
- [x] Finanzfunktionen: Keine
- [x] Gesundheitsfunktionen: Keine
- [x] Behörden-App: Nein
- [x] Werbe-ID: Nein
- [x] Kategorie: Tools
- [x] Tags: Datenschutz & Sicherheit, Kamera, Tools
- [x] Geschlossener Test: Release erstellt, AAB hochgeladen

### NOCH OFFEN ❌
- [ ] Fehler beheben: Länder/Regionen für geschlossenen Test auswählen
- [ ] Fehler beheben: Berechtigungen für Fotos/Videos erklären (Kamera-Nutzung begründen)
- [ ] 12 Tester finden (6 haben zugesagt, 6 fehlen noch)
- [ ] E-Mail-Liste in Play Console erstellen und Tester eintragen
- [ ] Geschlossenen Test veröffentlichen
- [ ] Test-Link an alle 12 Tester schicken
- [ ] 14 Tage warten (Test muss mindestens 14 Tage laufen)
- [ ] Produktionszugriff beantragen
- [ ] App für Produktion veröffentlichen
- [ ] Weitere Sprachen im Store-Eintrag hinzufügen (DE, TR, ES, FR)

### WICHTIGE DATEIEN
- AAB-Datei: C:\Users\Ati\Desktop\ProofStamp-release.aab (5,5 MB, 30.01.2026)
- Keystore: C:\Users\Ati\Desktop\ProofStamp\proofstamp-release.keystore (NIEMALS teilen!)
- Icon: C:\Users\Ati\Desktop\ProofStamp\store-assets\icon-512.png
- Feature Graphic: C:\Users\Ati\Desktop\ProofStamp\store-assets\feature-graphic.png
- Store-Texte: C:\Users\Ati\Desktop\ProofStamp\store-assets\store-listing.md

### TESTER-INFO
- Tester brauchen ein Google-Konto + Android-Handy
- Test-Link wird nach Veröffentlichung des geschlossenen Tests angezeigt
- Tester müssen Link öffnen → "Tester werden" → App installieren → 14 Tage behalten
- 6 Tester bestätigt, 6 noch offen

---

## NÄCHSTE PROJEKTE – App-Ideen Pipeline

### Projekt 1: OneLife / LifeBoard
**Idee:** Dein ganzes digitales Leben auf einem einzigen Screen.

**Das Problem:**
Nutzer wechseln täglich zwischen 7-8 Apps hin und her (WhatsApp, E-Mail, Kalender, Bank, Wetter, News, Social Media). Jedes Mal App öffnen, laden, scrollen, schließen. Das kostet Zeit und Aufmerksamkeit. Es gibt keine App die ALLES auf einen Blick zeigt.

**Was die App macht:**
- Ein einziges Dashboard das alle wichtigen Infos zusammenfasst
- Ungelesene Nachrichten (WhatsApp, SMS, E-Mail) – nur Anzahl + Vorschau
- Heutige Termine (Kalender)
- To-Do-Liste (heute fällig)
- Kontostand (Bank-API oder manuelle Eingabe)
- Wetter aktuell
- Nächster Bus/Bahn (optional)
- Bildschirmzeit-Zusammenfassung
- KEIN Scrollen, KEIN Feed – nur die Facts die du brauchst

**Zielgruppe:** Alle Smartphone-Nutzer die täglich zwischen vielen Apps wechseln (5,78 Mrd. Smartphone-Nutzer weltweit).

**Tech-Stack:** PWA + Capacitor Android, API-Integrationen (Kalender, Wetter), lokale Widgets, eventuell Android-Widget.

**Monetarisierung:** Freemium – Basis kostenlos, Premium mit Bank-Integration und erweiterten Widgets.

**Unique Selling Point:** Keine andere App zeigt ALLES auf einem Screen ohne Social-Media-Feed. Weniger Scrollen = mehr Zeit.

---

### Projekt 2: MoodSnap
**Idee:** Wie fühlst du dich NACH Social Media? Deine Stimmung tracken in 1 Tap.

**Das Problem:**
5,66 Milliarden Menschen nutzen Social Media durchschnittlich 2h 23min täglich. Viele fühlen sich danach schlecht, wissen aber nicht WELCHE App ihnen schadet und welche gut tut. Es gibt keine einfache Methode das herauszufinden. Mental Health + Social Media ist DAS Thema unserer Zeit.

**Was die App macht:**
- Nach jeder Social-Media-Session: 1 Tap = Stimmung bewerten (1-5 oder Emoji)
- App erkennt automatisch welche Social-Media-App gerade benutzt wurde (Android Usage API)
- Nach einer Woche zeigt die App Auswertungen:
  - "Nach TikTok fühlst du dich 70% schlechter"
  - "Nach YouTube fühlst du dich 60% besser"
  - "Instagram macht dich morgens traurig, abends neutral"
- Wöchentlicher/monatlicher Stimmungsbericht
- Trends über Zeit: Wird es besser oder schlechter?
- Optional: Empfehlungen ("Reduziere TikTok um 30 Min, ersetze durch YouTube")
- Ergebnisse als Grafik teilbar (viral: Leute posten ihre Ergebnisse)

**Zielgruppe:** Gen Z und Millennials (16-35 Jahre), besonders Frauen (höhere Social-Media-Nutzung). Riesiger Markt: 5,66 Mrd. Social-Media-Nutzer, Gen Z verbringt 4h täglich auf Social Media.

**Tech-Stack:** PWA + Capacitor Android, Android Usage Stats API (erkennt welche App genutzt wurde), lokale Datenbank (IndexedDB), Chart-Library für Auswertungen, Share-API für virale Verbreitung.

**Monetarisierung:** Freemium – Basis-Tracking kostenlos, Premium mit detaillierten Analysen, PDF-Reports und personalisierten Empfehlungen.

**Unique Selling Point:** Einfachste Mental-Health-App der Welt. 1 Tap. Keine Tagebücher, keine langen Fragebögen. Daten bleiben lokal (Privacy-First wie ProofStamp). Virales Potenzial weil Leute Ergebnisse teilen.

---

### Projekt 3: WhatIOwn / MyStuff
**Idee:** Digitales Inventar deines gesamten Besitzes – für Versicherung, Umzug und Überblick.

**Das Problem:**
Jeder Mensch besitzt hunderte Dinge (Laptop, TV, Möbel, Kleidung, Schmuck, Fahrrad, etc.) aber NIEMAND hat eine vollständige Liste. Wenn etwas passiert – Einbruch, Brand, Wasserschaden, Versicherungsfall – kann niemand sagen was genau fehlt oder beschädigt ist. Versicherungen verlangen eine Inventarliste, aber die hat keiner.

**Was die App macht:**
- Foto von jedem Gegenstand aufnehmen
- Infos hinzufügen: Name, Kategorie, Kaufdatum, Preis, Garantie-Ablauf
- Kategorien: Elektronik, Möbel, Kleidung, Schmuck, Fahrzeug, Dokumente, Sonstiges
- Gesamtwert deines Besitzes berechnen
- Garantie-Ablauf-Erinnerungen ("Dein Laptop hat noch 30 Tage Garantie")
- PDF-Export: Komplette Inventarliste für Versicherung
- Such- und Filterfunktion
- Umzugs-Modus: Gegenstände Räumen zuordnen, Checkliste beim Packen
- Optional: Kassenbon/Rechnung als Foto anhängen
- 100% offline, alle Daten lokal (Privacy-First)
- Backup/Restore per JSON

**Zielgruppe:** Mieter, Hausbesitzer, Versicherte, Menschen die umziehen. Praktisch JEDER Erwachsene braucht das, besonders in Kombination mit einer Hausratversicherung.

**Tech-Stack:** PWA + Capacitor Android (gleicher Stack wie ProofStamp), IndexedDB, Kamera-API, jsPDF für Export. Kann viel Code von ProofStamp wiederverwenden.

**Monetarisierung:** Freemium – Basis kostenlos (bis 50 Gegenstände), Premium unbegrenzt + Garantie-Erinnerungen + erweiterte PDF-Reports.

**Unique Selling Point:** Schwester-App zu ProofStamp. Gleiche Philosophie: Privacy-First, offline, einfach. ProofStamp sichert Beweise, WhatIOwn sichert Besitz. Zusammen ein starkes Duo. Niemand hat eine gute, einfache, offline Inventar-App.

---

### Projekt 4: ExpiryGuard (BEREITS GESTARTET)
**Status:** Konzept fertig, Ordner existiert: `C:\Users\Ati\Desktop\ExpiryGuard\NOTES.md`
**Verwandt mit:** SubTracker (projekt X in lofi-master, bereits gebaut)

**Idee:** Universeller Ablauf-Tracker – alles was in deinem Leben abläuft, an einem Ort.

**Das Problem:**
Jeder Mensch hat Dutzende Dinge die ablaufen – Reisepass, Führerschein, Versicherungen, Garantien, Verträge, Medikamente, TÜV, Kreditkarten, Visa, Kündigungsfristen. NIEMAND trackt das systematisch. Die meisten merken es erst wenn es zu spät ist – und dann kostet es Geld, Zeit oder verpasste Chancen.

**Was die App macht:**
- Dokument/Vertrag hinzufügen (Name, Ablaufdatum, Kategorie)
- Foto vom Dokument anhängen (lokal in IndexedDB)
- Erinnerungen: 30/60/90 Tage vorher (Browser-Notifications)
- Farbcodierung: Grün (OK), Gelb (bald ablaufend), Rot (abgelaufen)
- Vorlagen: Reisepass, Führerschein, Personalausweis, Versicherung, etc.
- Kategorien: Ausweise, Versicherungen, Verträge, Fahrzeug, Garantien, Gesundheit, Finanzen
- Export/Import als JSON-Backup
- Mehrsprachig (DE, EN, TR, ES, FR)
- Dark/Light Mode
- 100% offline, Privacy-First

**Zielgruppe:** Buchstäblich jeder Erwachsene auf der Welt. 5+ Milliarden Smartphone-Nutzer haben Dokumente die ablaufen.

**Tech-Stack:** HTML + CSS + Vanilla JS + PWA + Capacitor Android (gleicher Stack wie ProofStamp und SubTracker)

**Monetarisierung:** Freemium – Basis kostenlos, Premium mit erweiterten Erinnerungen und PDF-Export.

**Unique Selling Point:** Kein Mensch hat ein System für ablaufende Dinge. ExpiryGuard ist der digitale Post-It für dein ganzes Leben. Privacy-First wie alle unsere Apps.

---

### Projekt-Reihenfolge (Empfehlung)
1. **ExpiryGuard** – Konzept bereits fertig, Ordner existiert, muss nur gebaut werden
2. **WhatIOwn** – Am schnellsten zu bauen (90% gleicher Code wie ProofStamp), klarer Nutzen, Schwester-App
3. **MoodSnap** – Virales Potenzial, riesiger Markt, Mental Health Trend
4. **OneLife** – Am komplexesten (API-Integrationen), aber größtes Langzeit-Potenzial

### Bereits existierende Projekte
- **ProofStamp** – Digitale Beweissicherung (fertig, Play Store Veröffentlichung läuft)
- **SubTracker** – Abo-Tracker (fertig, in lofi-master/projekt X)
- **ExpiryGuard** – Ablauf-Tracker (Konzept fertig, C:\Users\Ati\Desktop\ExpiryGuard)
